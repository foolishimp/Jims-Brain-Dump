import { useState, useCallback, useEffect } from 'react';
import { useCanvas } from '../contexts/CanvasContext';

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

const useDraggable = (initialPosition: Position, onPositionChange: (position: Position) => void) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const { screenToCanvasCoordinates } = useCanvas();

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    if (initialPosition && typeof initialPosition.x === 'number' && typeof initialPosition.y === 'number') {
      const canvasPosition = screenToCanvasCoordinates(event.clientX, event.clientY);
      setDragOffset({
        x: canvasPosition.x - initialPosition.x,
        y: canvasPosition.y - initialPosition.y,
      });
    } else {
      console.error('Invalid initial position:', initialPosition);
      setDragOffset({ x: 0, y: 0 });
    }
  }, [initialPosition, screenToCanvasCoordinates]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      const canvasPosition = screenToCanvasCoordinates(event.clientX, event.clientY);
      const newX = canvasPosition.x - dragOffset.x;
      const newY = canvasPosition.y - dragOffset.y;
      onPositionChange({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset, onPositionChange, screenToCanvasCoordinates]);

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