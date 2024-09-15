import React, { useState } from 'react';
import styles from '../../styles/Postit.module.css';

interface ConnectionPointsProps {
  onStartConnection: (position: string) => void;
}

const ConnectionPoints: React.FC<ConnectionPointsProps> = ({ onStartConnection }) => {
  const [hoveredConnector, setHoveredConnector] = useState<string | null>(null);

  const connectionPoints = [
    { position: 'top', style: { top: '-10px', left: '50%', transform: 'translateX(-50%)' } },
    { position: 'right', style: { top: '50%', right: '-10px', transform: 'translateY(-50%)' } },
    { position: 'bottom', style: { bottom: '-10px', left: '50%', transform: 'translateX(-50%)' } },
    { position: 'left', style: { top: '50%', left: '-10px', transform: 'translateY(-50%)' } },
  ];

  return (
    <>
      {connectionPoints.map((point) => (
        <div
          key={point.position}
          className={`${styles.connectionPoint} ${hoveredConnector === point.position ? styles.hovered : ''}`}
          style={{
            ...point.style,
            width: '20px',
            height: '20px',
            backgroundColor: '#0077ff',
            border: '2px solid #ffffff',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
            position: 'absolute',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 2,
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