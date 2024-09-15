import React, { useCallback, useRef } from 'react';
import useDraggable from '../../hooks/useDraggable';

export interface PostitContainerProps {
  postit: {
    id: string;
    x: number;
    y: number;
    color?: string;
    isEditing: boolean;
  };
  updatePostit: (updates: Partial<{ x: number; y: number }>) => void;
  zoom: number;
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
  zoom,
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

  const handlePositionChange = useCallback((newPosition: { x: number; y: number }) => {
    updatePostit({ x: newPosition.x, y: newPosition.y });
  }, [updatePostit]);

  const { handleMouseDown } = useDraggable(
    { x: postit.x, y: postit.y },
    handlePositionChange,
    zoom
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
        fontSize: `${zoom >= 1 ? 16 : zoom >= 0.5 ? 14 : zoom >= 0.25 ? 12 : zoom >= 0.1 ? 10 : 8}px`,
        border: isSelected ? '2px solid #0077ff' : 'none',
        pointerEvents: 'auto',
        zIndex: isSelected || showColorMenu ? 999 : 998,
        transition: 'box-shadow 0.3s ease, border 0.3s ease',
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