import React, { useCallback, useRef, useEffect, useState } from 'react';
import InfiniteCanvas from './InfiniteCanvas';
import Postit from './Postit/Postit';
import ArrowManager from './ArrowManager';
import EventStackDisplay from './EventStackDisplay';
import TopMenu from './TopMenu';
import { useKeyboardEvent } from '../hooks/useKeyboardEvent';
import usePostitBoard from '../hooks/usePostitBoard';
import { exportDiagram } from '../utils/exportUtils';
import { importDiagram } from '../utils/importUtils';
import { saveToIndexedDB, loadFromBrowser } from '../utils/storageUtils';
import { Postit as PostitType, Arrow } from '../types';

const ZOOM_PARAMS = {
  minZoom: 0.1,
  maxZoom: 3,
  zoomFactor: 1.1
};

const PostitBoard: React.FC = () => {
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
    setArrows
  } = usePostitBoard();

  const [showEventStack, setShowEventStack] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('diagram');
  const boardRef = useRef<HTMLDivElement>(null);
  const arrowManagerRef = useRef<any>(null);
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
      const newFilename = await exportDiagram(postits, arrows, filename);
      setFilename(newFilename);
    } catch (err) {
      console.error('Failed to save the diagram:', err);
    }
  }, [postits, arrows, filename]);

  const handleLoad = useCallback(async () => {
    try {
      const { filename: newFilename, data } = await importDiagram();
      setPostits(data.postits);
      setArrows(data.arrows);
      setFilename(newFilename);
    } catch (err) {
      console.error('Failed to load the diagram:', err);
    }
  }, [setPostits, setArrows]);

  const toggleEventStack = useCallback(() => {
    setShowEventStack(prev => !prev);
  }, []);

  const handleBoardClick = useCallback((event: React.MouseEvent) => {
    if (arrowStart) {
      arrowManagerRef.current.handleCanvasClick(event);
    } else {
      setSelectedPostit(null);
      setSelectedArrow(null);
    }
  }, [arrowStart, setSelectedPostit, setSelectedArrow]);

  const handleDoubleClick = useCallback((event: React.MouseEvent, zoom: number, position: { x: number, y: number }) => {
    if (!arrowStart && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - position.x) / zoom;
      const y = (event.clientY - rect.top - position.y) / zoom;

      console.log('PostitBoard: Double-click debug', {
        rawClick: { x: event.clientX, y: event.clientY },
        canvasPosition: position,
        zoom,
        calculatedPosition: { x, y }
      });

      const newPostit = createPostit(x, y);
      console.log('PostitBoard: New Postit created:', newPostit);

      // Add visual indicator
      const indicator = document.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.left = `${event.clientX - rect.left}px`;
      indicator.style.top = `${event.clientY - rect.top}px`;
      indicator.style.width = '10px';
      indicator.style.height = '10px';
      indicator.style.backgroundColor = 'red';
      indicator.style.borderRadius = '50%';
      indicator.style.zIndex = '9999';
      indicator.style.pointerEvents = 'none';
      boardRef.current.appendChild(indicator);
      setTimeout(() => boardRef.current?.removeChild(indicator), 2000);
    }
  }, [arrowStart, createPostit]);

  const handleSelectPostit = useCallback((id: string) => {
    setSelectedPostit(id);
    setSelectedArrow(null);
  }, [setSelectedPostit, setSelectedArrow]);

  const handleStartConnection = useCallback((id: string, position: string) => {
    setArrowStart({ id, position });
  }, [setArrowStart]);

  const handlePostitClick = useCallback((event: React.MouseEvent, postitId: string) => {
    if (arrowStart && arrowStart.id !== postitId) {
      arrowManagerRef.current.handlePostitClick(event, postitId);
    } else {
      handleSelectPostit(postitId);
    }
  }, [arrowStart, handleSelectPostit]);

  const handleUpdatePostit = useCallback((id: string, updates: Partial<PostitType>) => {
    updatePostit(id, updates);
  }, [updatePostit]);

  const handleCreatePostitAndArrow = useCallback((x: number, y: number, startPostitId: string) => {
    const newPostit = createPostit(x, y);
    if (newPostit && startPostitId) {
      const newArrow: Arrow = {
        id: Date.now().toString(),
        startId: startPostitId,
        endId: newPostit.id,
        startPosition: 'right',
        endPosition: 'left',
      };
      createArrow(newArrow);
    }
    return newPostit;
  }, [createPostit, createArrow]);

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
        />
      </div>
      <InfiniteCanvas 
        onDoubleClick={handleDoubleClick}
        disablePanZoom={!!arrowStart}
        topOffset={toolbarHeight}
        zoomParams={ZOOM_PARAMS}
      >
        {({ zoom, position }: { zoom: number, position: { x: number, y: number } }) => (
          <>
            <ArrowManager
              ref={arrowManagerRef}
              postits={postits}
              arrows={arrows}
              arrowStart={arrowStart}
              setArrowStart={setArrowStart}
              boardRef={boardRef}
              zoom={zoom}
              position={position}
              selectedArrow={selectedArrow}
              onArrowClick={setSelectedArrow}
              onCreateArrow={createArrow}
              onCreatePostitAndArrow={handleCreatePostitAndArrow}
            />
            {postits.map((postit) => (
              <Postit
                key={postit.id}
                postit={postit}
                updatePostit={handleUpdatePostit}
                zoom={zoom}
                canvasPosition={position}
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

export default PostitBoard;