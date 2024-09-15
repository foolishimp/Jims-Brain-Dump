import React, { useCallback, forwardRef, useState, useEffect } from 'react';
import Arrow from './Arrow/Arrow';
import { Postit, Arrow as ArrowType } from '../types';

const POSTIT_WIDTH = 200;
const POSTIT_HEIGHT = 150;

interface ArrowManagerProps {
  postits: Postit[];
  arrows: ArrowType[];
  arrowStart: { id: string; position: string } | null;
  setArrowStart: React.Dispatch<React.SetStateAction<{ id: string; position: string } | null>>;
  boardRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  position: { x: number; y: number };
  selectedArrow: string | null;
  onArrowClick: (id: string) => void;
  onCreateArrow: (arrow: ArrowType) => void;
  onCreatePostitAndArrow: (x: number, y: number, startPostitId: string) => Postit | undefined;
}

interface ArrowManagerHandle {
  handlePostitClick: (event: React.MouseEvent, postitId: string) => void;
  handleCanvasClick: (event: React.MouseEvent) => void;
}

interface ConnectionPoint {
  x: number;
  y: number;
  position: string;
  distance?: number;
}

const ArrowManager = forwardRef<ArrowManagerHandle, ArrowManagerProps>(({ 
  postits, 
  arrows, 
  arrowStart, 
  setArrowStart, 
  boardRef, 
  zoom, 
  position, 
  selectedArrow,
  onArrowClick,
  onCreateArrow,
  onCreatePostitAndArrow
}, ref) => {
  const [tempArrow, setTempArrow] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);

  const getPostitConnectionPoints = useCallback((postit: Postit): ConnectionPoint[] => {
    return [
      { x: postit.x + POSTIT_WIDTH / 2, y: postit.y, position: 'top' },
      { x: postit.x + POSTIT_WIDTH, y: postit.y + POSTIT_HEIGHT / 2, position: 'right' },
      { x: postit.x + POSTIT_WIDTH / 2, y: postit.y + POSTIT_HEIGHT, position: 'bottom' },
      { x: postit.x, y: postit.y + POSTIT_HEIGHT / 2, position: 'left' },
    ];
  }, []);

  const getClosestConnectionPoint = useCallback((postit: Postit, targetX: number, targetY: number): ConnectionPoint => {
    const points = getPostitConnectionPoints(postit);
    return points.reduce((closest, point) => {
      const distance = Math.sqrt(Math.pow(point.x - targetX, 2) + Math.pow(point.y - targetY, 2));
      return distance < (closest.distance ?? Infinity) ? { ...point, distance } : closest;
    }, { x: 0, y: 0, position: '', distance: Infinity });
  }, [getPostitConnectionPoints]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (arrowStart && boardRef.current) {
      const startPostit = postits.find(p => p.id === arrowStart.id);
      if (startPostit) {
        const rect = boardRef.current.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left - position.x) / zoom;
        const mouseY = (event.clientY - rect.top - position.y) / zoom;
        const startPoint = getClosestConnectionPoint(startPostit, mouseX, mouseY);
        setTempArrow({
          startX: startPoint.x,
          startY: startPoint.y,
          endX: mouseX,
          endY: mouseY,
        });
      }
    }
  }, [arrowStart, postits, boardRef, zoom, position, getClosestConnectionPoint]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && arrowStart) {
      setArrowStart(null);
      setTempArrow(null);
    }
  }, [arrowStart, setArrowStart]);

  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      board.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        board.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [boardRef, handleMouseMove, handleKeyDown]);

  const handlePostitClick = useCallback((event: React.MouseEvent, postitId: string) => {
    if (arrowStart && arrowStart.id !== postitId) {
      event.stopPropagation();
      const startPostit = postits.find(p => p.id === arrowStart.id);
      const endPostit = postits.find(p => p.id === postitId);
      if (startPostit && endPostit && boardRef.current) {
        const startPoint = getClosestConnectionPoint(startPostit, endPostit.x, endPostit.y);
        const endPoint = getClosestConnectionPoint(endPostit, startPostit.x, startPostit.y);
        const newArrow: ArrowType = {
          id: Date.now().toString(),
          startId: arrowStart.id,
          endId: postitId,
          startPosition: startPoint.position,
          endPosition: endPoint.position,
        };
        console.log('Creating new arrow:', newArrow);
        onCreateArrow(newArrow);
        setArrowStart(null);
        setTempArrow(null);
      }
    }
  }, [arrowStart, postits, boardRef, getClosestConnectionPoint, onCreateArrow, setArrowStart]);

  const isPointInsidePostit = useCallback((x: number, y: number, postit: Postit) => {
    return x >= postit.x && x <= postit.x + POSTIT_WIDTH && y >= postit.y && y <= postit.y + POSTIT_HEIGHT;
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (arrowStart && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - position.x) / zoom;
      const y = (event.clientY - rect.top - position.y) / zoom;
      
      const clickedPostit = postits.find(postit => isPointInsidePostit(x, y, postit));
      
      if (clickedPostit) {
        handlePostitClick(event, clickedPostit.id);
      } else {
        console.log('Creating new postit and arrow at:', x, y);
        onCreatePostitAndArrow(x, y, arrowStart.id);
        setArrowStart(null);
        setTempArrow(null);
      }
    }
  }, [arrowStart, boardRef, zoom, position, postits, isPointInsidePostit, handlePostitClick, onCreatePostitAndArrow, setArrowStart]);

  React.useImperativeHandle(ref, () => ({
    handlePostitClick,
    handleCanvasClick
  }));

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 1000,
      }}
      onClick={handleCanvasClick}
    >
      {arrows.map((arrow: ArrowType) => {
        const startPostit = postits.find(p => p.id === arrow.startId);
        const endPostit = postits.find(p => p.id === arrow.endId);
        if (startPostit && endPostit) {
          const startPoint = getClosestConnectionPoint(startPostit, endPostit.x, endPostit.y);
          const endPoint = getClosestConnectionPoint(endPostit, startPostit.x, startPostit.y);
          return (
            <Arrow
              key={arrow.id}
              id={arrow.id}
              startX={startPoint.x}
              startY={startPoint.y}
              endX={endPoint.x}
              endY={endPoint.y}
              zoom={zoom}
              isSelected={selectedArrow === arrow.id}
              onClick={onArrowClick}
              isTemporary={false}
            />
          );
        }
        return null;
      })}
      {tempArrow && (
        <Arrow
          key="temp-arrow"
          startX={tempArrow.startX}
          startY={tempArrow.startY}
          endX={tempArrow.endX}
          endY={tempArrow.endY}
          zoom={zoom}
          color="#ff0000"
          isTemporary={true}
        />
      )}
    </div>
  );
});

export default ArrowManager;