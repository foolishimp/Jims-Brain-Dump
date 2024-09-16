import React, { useCallback, forwardRef, useState, useEffect, useMemo } from 'react';
import Arrow from './Arrow/Arrow';
import { Postit, Arrow as ArrowType } from '../types';
import { getClosestConnectionPoint } from '../utils/postit';

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

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (arrowStart && boardRef.current) {
      const startPostit = postits.find(p => p.id === arrowStart.id);
      if (startPostit) {
        const rect = boardRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - position.x) / zoom;
        const y = (event.clientY - rect.top - position.y) / zoom;
        const startPoint = getClosestConnectionPoint(startPostit, x, y);
        if (startPoint) {
          setTempArrow({
            startX: startPoint.x,
            startY: startPoint.y,
            endX: x,
            endY: y,
          });
        }
      }
    }
  }, [arrowStart, postits, boardRef, zoom, position]);

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
        const rect = boardRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left - position.x) / zoom;
        const y = (event.clientY - rect.top - position.y) / zoom;
        const endPoint = getClosestConnectionPoint(endPostit, x, y);
        if (endPoint) {
          const newArrow: ArrowType = {
            id: Date.now().toString(),
            startId: arrowStart.id,
            endId: postitId,
            startPosition: arrowStart.position,
            endPosition: endPoint.position,
          };
          console.log('Creating new arrow:', newArrow);
          onCreateArrow(newArrow);
          setArrowStart(null);
          setTempArrow(null);
        }
      }
    }
  }, [arrowStart, postits, boardRef, zoom, position, onCreateArrow, setArrowStart]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (arrowStart && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - position.x) / zoom;
      const y = (event.clientY - rect.top - position.y) / zoom;
      
      console.log('Creating new postit and arrow at:', x, y);
      onCreatePostitAndArrow(x, y, arrowStart.id);
      setArrowStart(null);
      setTempArrow(null);
    }
  }, [arrowStart, boardRef, zoom, position, onCreatePostitAndArrow, setArrowStart]);

  React.useImperativeHandle(ref, () => ({
    handlePostitClick,
    handleCanvasClick
  }));

  const renderArrows = useMemo(() => {
    return arrows.map((arrow: ArrowType) => {
      const startPostit = postits.find(p => p.id === arrow.startId);
      const endPostit = postits.find(p => p.id === arrow.endId);
      if (startPostit && endPostit) {
        const startPoint = getClosestConnectionPoint(startPostit, endPostit.x, endPostit.y);
        const endPoint = getClosestConnectionPoint(endPostit, startPostit.x, startPostit.y);
        if (startPoint && endPoint) {
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
      }
      return null;
    });
  }, [arrows, postits, zoom, selectedArrow, onArrowClick]);

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
      {renderArrows}
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

export default React.memo(ArrowManager);