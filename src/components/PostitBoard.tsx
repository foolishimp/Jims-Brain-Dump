import React, { useCallback, useRef, useEffect, useState } from 'react';
import InfiniteCanvas from './InfiniteCanvas';
import Postit from './Postit/Postit';
import ArrowManager, { ArrowManagerHandle } from './ArrowManager';
import EventStackDisplay from './EventStackDisplay';
import TopMenu from './TopMenu';
import { useKeyboardEvent } from '../hooks/useKeyboardEvent';
import usePostitBoard from '../hooks/usePostitBoard';
import { exportDiagram } from '../utils/exportUtils';
import { importDiagram } from '../utils/importUtils';
import { saveToIndexedDB, loadFromBrowser } from '../utils/storageUtils';
import { Postit as PostitType } from '../types';
import { CanvasProvider, useCanvas } from '../contexts/CanvasContext';

const ZOOM_PARAMS = {
  minZoom: 0.1,
  maxZoom: 3,
  zoomFactor: 1.1
};

const PostitBoardContent: React.FC = () => {
  const {
    postits,
    arrows,
    selectedPostit,
    selectedArrow,
    arrowStart,
    setSelectedPostit,
    setSelectedArrow,
    setArrowStart,
    createPostit,
    updatePostit,
    createArrow,
    deleteSelectedItem,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    eventLog,
    setPostits,
    setArrows,
    resetBoard
  } = usePostitBoard();

  const { screenToCanvasCoordinates, canvasToScreenCoordinates } = useCanvas();

  const [showEventStack, setShowEventStack] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('diagram');
  const boardRef = useRef<HTMLDivElement>(null);
  const arrowManagerRef = useRef<ArrowManagerHandle>(null);
  const [toolbarHeight, setToolbarHeight] = useState<number>(0);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateToolbarHeight = () => {
      if (toolbarRef.current) {
        setToolbarHeight(toolbarRef.current.offsetHeight);
      }
    };

    updateToolbarHeight();
    window.addEventListener('resize', updateToolbarHeight);

    return () => {
      window.removeEventListener('resize', updateToolbarHeight);
    };
  }, []);

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadFromBrowser();
      if (savedData) {
        setPostits(savedData.postits || []);
        setArrows(savedData.arrows || []);
      }
    };
    loadSavedData();
  }, [setPostits, setArrows]);

  useEffect(() => {
    const saveData = async () => {
      await saveToIndexedDB({ postits, arrows });
      localStorage.setItem('lastSave', JSON.stringify({ postits, arrows }));
    };
    saveData();
  }, [postits, arrows]);

  const handleSave = useCallback(async () => {
    try {
      const newFilename = await exportDiagram(postits, arrows, filename, canvasToScreenCoordinates);
      setFilename(newFilename);
    } catch (err) {
      console.error('Failed to save the diagram:', err);
    }
  }, [postits, arrows, filename, canvasToScreenCoordinates]);

  const handleLoad = useCallback(async () => {
    try {
      const { filename: newFilename, data } = await importDiagram(screenToCanvasCoordinates);
      setPostits(data.postits);
      setArrows(data.arrows);
      setFilename(newFilename);
    } catch (err) {
      console.error('Failed to load the diagram:', err);
    }
  }, [setPostits, setArrows, screenToCanvasCoordinates]);

  const toggleEventStack = useCallback(() => {
    setShowEventStack(prev => !prev);
  }, []);

  const handleBoardClick = useCallback((event: React.MouseEvent) => {
    if (arrowStart && arrowManagerRef.current) {
      arrowManagerRef.current.handleCanvasClick(event);
    } else {
      setSelectedPostit(null);
      setSelectedArrow(null);
    }
  }, [arrowStart, setSelectedPostit, setSelectedArrow]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!arrowStart && boardRef.current) {
      const { x, y } = screenToCanvasCoordinates(event.clientX, event.clientY);
      const newPostit = createPostit(x, y);
      console.log('PostitBoard: New Postit created:', newPostit);
    }
  }, [arrowStart, createPostit, screenToCanvasCoordinates]);

  const handleSelectPostit = useCallback((id: string) => {
    setSelectedPostit(id);
    setSelectedArrow(null);
  }, [setSelectedPostit, setSelectedArrow]);

  const handleStartConnection = useCallback((id: string, position: string) => {
    setArrowStart({ id, position });
  }, [setArrowStart]);

  useEffect(() => {
    console.log('PostitBoard: arrows state updated', arrows);
  }, [arrows]);

  const handlePostitClick = useCallback((event: React.MouseEvent, postitId: string) => {
    if (arrowStart && arrowStart.id !== postitId && arrowManagerRef.current) {
      console.log('PostitBoard: Attempting to create arrow', { start: arrowStart, end: postitId });
      arrowManagerRef.current.handlePostitClick(event, postitId);
    } else {
      handleSelectPostit(postitId);
    }
  }, [arrowStart, handleSelectPostit]);

  const handleUpdatePostit = useCallback((id: string, updates: Partial<PostitType>) => {
    updatePostit(id, updates);
  }, [updatePostit]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the board? This action cannot be undone.')) {
      resetBoard();
    }
  }, [resetBoard]);

  useKeyboardEvent('Delete', deleteSelectedItem, [deleteSelectedItem]);
  useKeyboardEvent('z', handleUndo, [handleUndo], { ctrlKey: true, triggerOnInput: false });
  useKeyboardEvent('y', handleRedo, [handleRedo], { ctrlKey: true, triggerOnInput: false });

  return (
    <div ref={boardRef} onClick={handleBoardClick} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {showEventStack && (
        <EventStackDisplay 
          eventLog={eventLog} 
          topOffset={toolbarHeight} 
          eventLimit={20} 
        />
      )}
      <div ref={toolbarRef}>
        <TopMenu
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onLoad={handleLoad}
          showEventStack={showEventStack}
          onToggleEventStack={toggleEventStack}
          onReset={handleReset}
        />
      </div>
      <InfiniteCanvas 
        onDoubleClick={handleDoubleClick}
        disablePanZoom={!!arrowStart}
        topOffset={toolbarHeight}
        zoomParams={ZOOM_PARAMS}
      >
        {() => (
          <>
            <ArrowManager
              ref={arrowManagerRef}
              postits={postits}
              arrows={arrows}
              arrowStart={arrowStart}
              setArrowStart={setArrowStart}
              selectedArrow={selectedArrow}
              onArrowClick={setSelectedArrow}
              onCreateArrow={createArrow}
            />
            {postits.map((postit) => (
              <Postit
                key={postit.id}
                postit={postit}
                updatePostit={handleUpdatePostit}
                isSelected={selectedPostit === postit.id}
                onSelect={handleSelectPostit}
                onStartConnection={handleStartConnection}
                onPostitClick={handlePostitClick}
                isDrawingArrow={!!arrowStart}
              />
            ))}
          </>
        )}
      </InfiniteCanvas>
    </div>
  );
};

const PostitBoard: React.FC = () => {
  return (
    <CanvasProvider>
      <PostitBoardContent />
    </CanvasProvider>
  );
};

export default PostitBoard;