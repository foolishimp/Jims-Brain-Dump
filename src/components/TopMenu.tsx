import React from 'react';

interface TopMenuProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  showEventStack: boolean;
  onToggleEventStack: () => void;
}

const TopMenu: React.FC<TopMenuProps> = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  onSave, 
  onLoad, 
  showEventStack, 
  onToggleEventStack 
}) => {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px 15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <button onClick={onUndo} disabled={!canUndo}>Undo</button>
      <button onClick={onRedo} disabled={!canRedo}>Redo</button>
      <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 10px' }} />
      <button onClick={onSave}>Save</button>
      <button onClick={onLoad}>Load</button>
      <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 10px' }} />
      <button 
        onClick={onToggleEventStack}
        style={{
          backgroundColor: showEventStack ? '#4CAF50' : '#f0f0f0',
          color: showEventStack ? 'white' : 'black',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s, color 0.3s'
        }}
      >
        Events
      </button>
    </div>
  );
};

export default TopMenu;