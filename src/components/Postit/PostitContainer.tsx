import React, { useCallback, useRef } from 'react';
import useDraggable from '../../hooks/useDraggable';
import { useCanvas } from '../../contexts/CanvasContext';

export interface PostitContainerProps {
  postit: {
    id: string;
    x: number;
    y: number;
    color?: string;
    isEditing: boolean;
  };
  updatePostit: (updates: Partial<{ x: number; y: number }>) => void;
  isSelected: boolean;
  isDrawingArrow: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: (event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent) => void;
  children: React.ReactNode;
  showColorMenu: boolean;
  onStopEditing: () => void;
}

const PostitContainer: React.FC<PostitContainerProps> = ({
  postit,
  updatePostit,
  isSelected,
  isDrawingArrow,
  onClick,
  onDoubleClick,
  onContextMenu,
  children,
  showColorMenu,
  onStopEditing
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { zoom, screenToCanvasCoordinates } = useCanvas();

  const handlePositionChange = useCallback((newPosition: { x: number; y: number }) => {
    const canvasPosition = screenToCanvasCoordinates(newPosition.x, newPosition.y);
    updatePostit({ x: canvasPosition.x, y: canvasPosition.y });
  }, [updatePostit, screenToCanvasCoordinates]);

  const { handleMouseDown } = useDraggable(
    { x: postit.x, y: postit.y },
    handlePositionChange
  );

  console.log(`PostitContainer: Positioning Postit ${postit.id} at:`, { x: postit.x, y: postit.y });

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${postit.x}px`,
        top: `${postit.y}px`,
        width: '200px',
        height: '150px',
        backgroundColor: postit.color || '#ffff88',
        boxShadow: isSelected ? '0 0 10px rgba(0,0,0,0.5)' : '2px 2px 5px rgba(0,0,0,0.2)',
        padding: '10px',
        cursor: isDrawingArrow ? 'crosshair' : (postit.isEditing ? 'text' : 'grab'),
        fontSize: `${16 / zoom}px`,
        border: isSelected ? '2px solid #0077ff' : 'none',
        pointerEvents: 'auto',
        zIndex: isSelected || showColorMenu ? 999 : 998,
        transition: 'box-shadow 0.3s ease, border 0.3s ease',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
      onMouseDown={!isDrawingArrow && !postit.isEditing ? handleMouseDown : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
};

export default React.memo(PostitContainer);