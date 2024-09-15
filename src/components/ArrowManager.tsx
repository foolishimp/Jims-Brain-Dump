import React, { useCallback, forwardRef, useState, useEffect } from 'react';
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
  const { canvasToScreenCoordinates, screenToCanvasCoordinates } = useCanvas();

  const getIntersectionPoint = useCallback((postit: Postit, targetX: number, targetY: number) => {
    const { x: screenX, y: screenY } = canvasToScreenCoordinates(postit.x, postit.y);
    const centerX = screenX + POSTIT_WIDTH / 2;
    const centerY = screenY + POSTIT_HEIGHT / 2;
    
    const dx = targetX - centerX;
    const dy = targetY - centerY;
    
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (absDx * POSTIT_HEIGHT > absDy * POSTIT_WIDTH) {
      // Intersects with left or right edge
      const x = centerX + (dx > 0 ? POSTIT_WIDTH / 2 : -POSTIT_WIDTH / 2);
      const y = centerY + dy * (POSTIT_WIDTH / 2) / absDx;
      return { x, y };
    } else {
      // Intersects with top or bottom edge
      const x = centerX + dx * (POSTIT_HEIGHT / 2) / absDy;
      const y = centerY + (dy > 0 ? POSTIT_HEIGHT / 2 : -POSTIT_HEIGHT / 2);
      return { x, y };
    }
  }, [canvasToScreenCoordinates]);

  const handlePostitClick = useCallback((event: React.MouseEvent, postitId: string) => {
    if (arrowStart && arrowStart.id !== postitId) {
      event.stopPropagation();
      const startPostit = postits.find(p => p.id === arrowStart.id);
      const endPostit = postits.find(p => p.id === postitId);
      if (startPostit && endPostit) {
        const newArrow: ArrowType = {
          id: Date.now().toString(),
          startId: arrowStart.id,
          endId: postitId,
          startPosition: 'center',
          endPosition: 'center',
        };
        onCreateArrow(newArrow);
        setArrowStart(null);
        setTempArrow(null);
      }
    }
  }, [arrowStart, postits, onCreateArrow, setArrowStart]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (arrowStart && boardRef.current) {
      const { x, y } = screenToCanvasCoordinates(event.clientX, event.clientY);
      
      const clickedPostit = postits.find(postit => 
        x >= postit.x && x <= postit.x + POSTIT_WIDTH / zoom && 
        y >= postit.y && y <= postit.y + POSTIT_HEIGHT / zoom
      );
      
      if (clickedPostit) {
        handlePostitClick(event, clickedPostit.id);
      } else {
        onCreatePostitAndArrow(x, y, arrowStart.id);
        setArrowStart(null);
        setTempArrow(null);
      }
    }
  }, [arrowStart, boardRef, zoom, postits, handlePostitClick, onCreatePostitAndArrow, setArrowStart, screenToCanvasCoordinates]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (arrowStart && boardRef.current) {
        const startPostit = postits.find(p => p.id === arrowStart.id);
        if (startPostit) {
          const { x: endX, y: endY } = screenToCanvasCoordinates(event.clientX, event.clientY);
          const startPoint = getIntersectionPoint(startPostit, endX, endY);
          setTempArrow({
            startX: startPoint.x,
            startY: startPoint.y,
            endX,
            endY,
          });
        }
      }
    };
  
    const currentBoardRef = boardRef.current;
  
    if (currentBoardRef) {
      currentBoardRef.addEventListener('mousemove', handleMouseMove);
    }
  
    return () => {
      if (currentBoardRef) {
        currentBoardRef.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [arrowStart, boardRef, postits, getIntersectionPoint, screenToCanvasCoordinates]);

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
        zIndex: 999,
      }}
      onClick={handleCanvasClick}
    >
      {arrows.map((arrow: ArrowType) => {
        const startPostit = postits.find(p => p.id === arrow.startId);
        const endPostit = postits.find(p => p.id === arrow.endId);
        if (startPostit && endPostit) {
          const startPoint = getIntersectionPoint(startPostit, endPostit.x + POSTIT_WIDTH / 2, endPostit.y + POSTIT_HEIGHT / 2);
          const endPoint = getIntersectionPoint(endPostit, startPostit.x + POSTIT_WIDTH / 2, startPostit.y + POSTIT_HEIGHT / 2);
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