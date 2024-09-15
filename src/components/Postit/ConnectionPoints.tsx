import React, { useState } from 'react';
import styles from '../../styles/Postit.module.css';

interface ConnectionPointsProps {
  onStartConnection: (position: string) => void;
}

const ConnectionPoints: React.FC<ConnectionPointsProps> = ({ onStartConnection }) => {
  const [hoveredConnector, setHoveredConnector] = useState<string | null>(null);

  const connectionPoints = [
    { position: 'top', style: { top: '-12px', left: '50%', transform: 'translateX(-50%)' } },
    { position: 'right', style: { top: '50%', right: '-12px', transform: 'translateY(-50%)' } },
    { position: 'bottom', style: { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' } },
    { position: 'left', style: { top: '50%', left: '-12px', transform: 'translateY(-50%)' } },
  ];

  return (
    <>
      {connectionPoints.map((point) => (
        <div
          key={point.position}
          className={`${styles.connectionPoint} ${hoveredConnector === point.position ? styles.hovered : ''}`}
          style={{
            ...point.style,
            width: '24px',
            height: '24px',
            backgroundColor: 'rgba(0, 119, 255, 0.7)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
            position: 'absolute',
            borderRadius: '50%',
            cursor: 'crosshair',
            zIndex: 1002,
            pointerEvents: 'auto',
          }}
          onMouseEnter={() => setHoveredConnector(point.position)}
          onMouseLeave={() => setHoveredConnector(null)}
          onMouseDown={(e) => {
            e.stopPropagation();
            onStartConnection(point.position);
          }}
        />
      ))}
    </>
  );
};

export default React.memo(ConnectionPoints);