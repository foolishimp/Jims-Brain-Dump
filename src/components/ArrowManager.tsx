import React, { useCallback, forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import Arrow from './Arrow/Arrow';
import { Postit, Arrow as ArrowType } from '../types';
import { useCanvas } from '../contexts/CanvasContext';

const POSTIT_WIDTH = 200;
const POSTIT_HEIGHT = 150;

interface ArrowManagerProps {
  postits: Postit[];
  arrows: ArrowType[];
  arrowStart: { id: string; position: string } | null;
  setArrowStart: React.Dispatch<React.SetStateAction<{ id: string; position: string } | null>>;
  selectedArrow: string | null;
  onArrowClick: (id: string) => void;
  onCreateArrow: (arrow: ArrowType) => void;
}

export interface ArrowManagerHandle {
  handlePostitClick: (event: React.MouseEvent, postitId: string) => void;
  handleCanvasClick: (event: React.MouseEvent) => void;
}

const ArrowManager = forwardRef<ArrowManagerHandle, ArrowManagerProps>(({ 
  postits, 
  arrows, 
  arrowStart, 
  setArrowStart, 
  selectedArrow,
  onArrowClick,
  onCreateArrow,
}, ref) => {
  const [tempArrow, setTempArrow] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const { canvasToScreenCoordinates } = useCanvas();

  const getConnectionPoint = useCallback((postit: Postit, position: string) => {
    const { x, y } = canvasToScreenCoordinates(postit.x, postit.y);
    switch (position) {
      case 'top': return { x: x + POSTIT_WIDTH / 2, y };
      case 'right': return { x: x + POSTIT_WIDTH, y: y + POSTIT_HEIGHT / 2 };
      case 'bottom': return { x: x + POSTIT_WIDTH / 2, y: y + POSTIT_HEIGHT };
      case 'left': return { x, y: y + POSTIT_HEIGHT / 2 };
      default: return { x: x + POSTIT_WIDTH / 2, y: y + POSTIT_HEIGHT / 2 };
    }
  }, [canvasToScreenCoordinates]);

  const handlePostitClick = useCallback((event: React.MouseEvent, postitId: string) => {
    if (arrowStart && arrowStart.id !== postitId) {
      const startPostit = postits.find(p => p.id === arrowStart.id);
      const endPostit = postits.find(p => p.id === postitId);
      if (startPostit && endPostit) {
        const newArrow: ArrowType = {
          id: Date.now().toString(),
          startId: arrowStart.id,
          endId: postitId,
          startPosition: arrowStart.position,
          endPosition: 'left', // Default to left, can be improved
        };
        onCreateArrow(newArrow);
        setArrowStart(null);
        setTempArrow(null);
      }
    }
  }, [arrowStart, postits, onCreateArrow, setArrowStart]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    setArrowStart(null);
    setTempArrow(null);
  }, [setArrowStart]);

  useImperativeHandle(ref, () => ({
    handlePostitClick,
    handleCanvasClick
  }), [handlePostitClick, handleCanvasClick]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (arrowStart) {
        const startPostit = postits.find(p => p.id === arrowStart.id);
        if (startPostit) {
          const startPoint = getConnectionPoint(startPostit, arrowStart.position);
          setTempArrow({
            startX: startPoint.x,
            startY: startPoint.y,
            endX: event.clientX,
            endY: event.clientY,
          });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [arrowStart, postits, getConnectionPoint]);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {arrows.map((arrow) => {
        const startPostit = postits.find(p => p.id === arrow.startId);
        const endPostit = postits.find(p => p.id === arrow.endId);
        if (startPostit && endPostit) {
          const startPoint = getConnectionPoint(startPostit, arrow.startPosition);
          const endPoint = getConnectionPoint(endPostit, arrow.endPosition);
          return (
            <Arrow
              key={arrow.id}
              id={arrow.id}
              startX={startPoint.x}
              startY={startPoint.y}
              endX={endPoint.x}
              endY={endPoint.y}
              isSelected={selectedArrow === arrow.id}
              onClick={onArrowClick}
            />
          );
        }
        return null;
      })}
      {tempArrow && (
        <Arrow
          startX={tempArrow.startX}
          startY={tempArrow.startY}
          endX={tempArrow.endX}
          endY={tempArrow.endY}
          color="#ff0000"
          isTemporary
        />
      )}
    </svg>
  );
});

export default ArrowManager;