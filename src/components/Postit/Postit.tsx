import React, { useCallback, memo, useState, useRef } from 'react';
import PostitContainer, { PostitContainerProps } from './PostitContainer';
import PostitContent from './PostitContent';
import ConnectionPoints from './ConnectionPoints';
import ColorMenu from './ColorMenu';
import { POSTIT_COLORS } from '../../utils/colorUtils';
import { Postit as PostitType } from '../../types';

interface PostitProps {
  postit: PostitType;
  updatePostit: (id: string, updates: Partial<PostitType>) => void;
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStartConnection: (id: string, position: string) => void;
  onPostitClick: (event: React.MouseEvent, id: string) => void;
  isDrawingArrow: boolean;
}

const Postit: React.FC<PostitProps> = memo(({
  postit,
  updatePostit,
  zoom,
  isSelected,
  onSelect,
  onStartConnection,
  onPostitClick,
  isDrawingArrow
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (!showColorMenu) {
      if (isDrawingArrow) {
        onPostitClick(event, postit.id);
      } else {
        onSelect(postit.id);
      }
    }
  }, [postit.id, onSelect, onPostitClick, isDrawingArrow, showColorMenu]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Double-click detected on Postit ${postit.id}`);
    updatePostit(postit.id, { isEditing: true });
  }, [postit.id, updatePostit]);
  
  const handleStartConnection = useCallback((position: string) => {
    if (!showColorMenu) {
      onStartConnection(postit.id, position);
    }
  }, [postit.id, onStartConnection, showColorMenu]);

  const handleUpdatePostit = useCallback((updates: Partial<PostitType>) => {
    updatePostit(postit.id, updates);
  }, [postit.id, updatePostit]);

  const handleStopEditing = useCallback(() => {
    updatePostit(postit.id, { isEditing: false });
  }, [postit.id, updatePostit]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowColorMenu(true);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    updatePostit(postit.id, { color });
    setShowColorMenu(false);
  }, [postit.id, updatePostit]);

  const handleCloseColorMenu = useCallback(() => {
    setShowColorMenu(false);
  }, []);

  const containerProps: PostitContainerProps = {
    postit,
    updatePostit: handleUpdatePostit,
    zoom,
    isSelected,
    isDrawingArrow,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onContextMenu: handleContextMenu,
    showColorMenu,
    onStopEditing: handleStopEditing,
    children: null // This will be overwritten by the actual children
  };
  

  return (
    <PostitContainer {...containerProps}>
      <PostitContent
        postit={postit}
        updatePostit={handleUpdatePostit}
        onStopEditing={handleStopEditing}
      />
      {isSelected && !isDrawingArrow && !showColorMenu && (
        <ConnectionPoints
          onStartConnection={handleStartConnection}
          width={200}
          height={150}
        />
      )}
      {showColorMenu && (
        <div 
          ref={colorMenuRef} 
          style={{ 
            position: 'absolute', 
            right: 0, 
            top: '100%', 
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ColorMenu
            colors={POSTIT_COLORS}
            onColorSelect={handleColorSelect}
            onClose={handleCloseColorMenu}
          />
        </div>
      )}
    </PostitContainer>
  );
});

export default Postit;