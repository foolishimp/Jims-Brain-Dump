import { useState, useCallback, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

const useDraggable = (initialPosition: Position, onPositionChange: (position: Position) => void, zoom: number) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    if (initialPosition && typeof initialPosition.x === 'number' && typeof initialPosition.y === 'number') {
      setDragOffset({
        x: event.clientX / zoom - initialPosition.x,
        y: event.clientY / zoom - initialPosition.y,
      });
    } else {
      console.error('Invalid initial position:', initialPosition);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [initialPosition, zoom]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      const newX = event.clientX / zoom - dragOffset.x;
      const newY = event.clientY / zoom - dragOffset.y;
      onPositionChange({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset, onPositionChange, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    isDragging,
    handleMouseDown,
  };
};

export default useDraggable;