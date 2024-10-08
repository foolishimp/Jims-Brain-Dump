import { useState, useCallback } from 'react';
import { createNewPostit } from '../utils/postit';
import { createEventLog, logEvent, undo, redo } from '../utils/eventLogUtils';
import { Postit, Arrow, EventLog, EventLogEntry } from '../types';

const usePostitBoard = () => {
  const [postits, setPostits] = useState<Postit[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [selectedPostit, setSelectedPostit] = useState<string | null>(null);
  const [selectedArrow, setSelectedArrow] = useState<string | null>(null);
  const [arrowStart, setArrowStart] = useState<{ id: string; position: string } | null>(null);
  const [eventLog, setEventLog] = useState<EventLog>(createEventLog());

  const handleEvent = useCallback((event: EventLogEntry) => {
    console.log('Handling event:', event);
    setEventLog((prevLog) => {
      const newLog = logEvent(prevLog, event);
      return newLog;
    });
  }, []);

  const createArrow = useCallback((newArrow: Arrow) => {
    console.log('Creating new arrow:', newArrow);
    setArrows((prevArrows) => [...prevArrows, newArrow]);
    handleEvent({
      target: 'Arrow',
      action: 'CREATE',
      data: newArrow,
    });
  }, [handleEvent]);

  const createPostit = useCallback((x: number, y: number) => {
    console.log('usePostitBoard: Creating new postit at:', { x, y });
    const newPostit = createNewPostit(x, y, '#ffff88');
    console.log('usePostitBoard: New postit created:', newPostit);
    setPostits((prevPostits) => [...prevPostits, newPostit]);
    handleEvent({
      target: 'Postit',
      action: 'CREATE',
      data: newPostit,
    });
    return newPostit;
  }, [handleEvent]);

  const updatePostit = useCallback((id: string, updates: Partial<Postit>) => {
    console.log(`updatePostit called with id: ${id}, updates:`, updates);
    
    setPostits((prevPostits) => {
      const postit = prevPostits.find((p) => p.id === id);
      if (!postit) {
        console.warn(`Postit with id ${id} not found`);
        return prevPostits;
      }

      const updatedPostit = { ...postit, ...updates };
      
      // Handle specific update types
      if (updates.x !== undefined && updates.y !== undefined) {
        handleEvent({
          target: 'Postit',
          action: 'MOVE',
          data: {
            id,
            oldX: postit.x,
            oldY: postit.y,
            newX: updates.x,
            newY: updates.y,
          },
        });
      } else if (updates.text !== undefined) {
        handleEvent({
          target: 'Postit',
          action: 'EDIT',
          data: {
            id,
            oldText: postit.text,
            newText: updates.text,
          },
        });
      } else if (updates.color !== undefined) {
        handleEvent({
          target: 'Postit',
          action: 'CHANGE_COLOR',
          data: {
            id,
            oldColor: postit.color,
            newColor: updates.color,
          },
        });
      }

      return prevPostits.map((p) => (p.id === id ? updatedPostit : p));
    });
  }, [handleEvent]);

  const deleteSelectedItem = useCallback(() => {
    if (selectedPostit) {
      console.log(`Deleting selected postit: ${selectedPostit}`);
      const deletedPostit = postits.find((p) => p.id === selectedPostit);
      const connectedArrows = arrows.filter(
        (arrow) => arrow.startId === selectedPostit || arrow.endId === selectedPostit
      );
      setPostits((prevPostits) => prevPostits.filter((p) => p.id !== selectedPostit));
      setArrows((prevArrows) => prevArrows.filter((a) => !connectedArrows.includes(a)));
      setSelectedPostit(null);
      handleEvent({
        target: 'Postit',
        action: 'DELETE',
        data: {
          postit: deletedPostit,
          connectedArrows,
        },
      });
    } else if (selectedArrow) {
      console.log(`Deleting selected arrow: ${selectedArrow}`);
      const deletedArrow = arrows.find((a) => a.id === selectedArrow);
      setArrows((prevArrows) => prevArrows.filter((a) => a.id !== selectedArrow));
      setSelectedArrow(null);
      handleEvent({
        target: 'Arrow',
        action: 'DELETE',
        data: deletedArrow,
      });
    }
  }, [selectedPostit, selectedArrow, postits, arrows, handleEvent]);

  const handleUndo = useCallback(() => {
    console.log('Undoing last action');
    setEventLog((prevLog) => {
      const { eventLog: newLog, newState } = undo(prevLog, { postits, arrows });
      setPostits(newState.postits);
      setArrows(newState.arrows);
      return newLog;
    });
  }, [postits, arrows]);

  const handleRedo = useCallback(() => {
    console.log('Redoing last undone action');
    setEventLog((prevLog) => {
      const { eventLog: newLog, newState } = redo(prevLog, { postits, arrows });
      setPostits(newState.postits);
      setArrows(newState.arrows);
      return newLog;
    });
  }, [postits, arrows]);

  const resetBoard = useCallback(() => {
    setPostits([]);
    setArrows([]);
    setSelectedPostit(null);
    setSelectedArrow(null);
    setArrowStart(null);
    setEventLog(createEventLog());
    handleEvent({
      target: 'Board',
      action: 'RESET',
      data: null,
    });
  }, [handleEvent]);

  return {
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
    canUndo: eventLog.past.length > 0 || eventLog.currentSequence.length > 0,
    canRedo: eventLog.future.length > 0,
    eventLog,
    setPostits,
    setArrows,
    resetBoard
  };
};

export default usePostitBoard;