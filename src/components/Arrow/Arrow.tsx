import React, { useCallback, useState } from 'react';

interface ArrowProps {
  id?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
  zoom?: number;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  isTemporary?: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ 
  id, 
  startX, 
  startY, 
  endX, 
  endY, 
  color = '#0077ff', 
  zoom = 1, 
  isSelected, 
  onClick, 
  isTemporary = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);

  const arrowHeadSize = 10 / zoom;
  const strokeWidth = (isSelected ? 4 : 2) / zoom;
  const clickAreaWidth = 10 / zoom;

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!isTemporary && onClick && id) {
      event.stopPropagation();
      onClick(id);
    }
  }, [onClick, id, isTemporary]);

  const handleMouseEnter = () => !isTemporary && setIsHovered(true);
  const handleMouseLeave = () => !isTemporary && setIsHovered(false);

  return (
    <svg
      style={{
        position: 'absolute',
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${Math.abs(dx)}px`,
        height: `${Math.abs(dy)}px`,
        overflow: 'visible',
        pointerEvents: isTemporary ? 'none' : 'auto',
        zIndex: isTemporary ? 1000 : 'auto',
      }}
    >
      <g transform={`rotate(${angle} 0 0)`}>
        <line
          x1="0"
          y1="0"
          x2={length - arrowHeadSize}
          y2="0"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <polygon
          points={`${length-arrowHeadSize},-${arrowHeadSize/2} ${length},0 ${length-arrowHeadSize},${arrowHeadSize/2}`}
          fill={color}
        />
        {!isTemporary && isHovered && (
          <line
            x1="0"
            y1="0"
            x2={length}
            y2="0"
            stroke={color}
            strokeWidth={clickAreaWidth}
            opacity={0.3}
          />
        )}
        {!isTemporary && (
          <line
            x1="0"
            y1="0"
            x2={length}
            y2="0"
            stroke="transparent"
            strokeWidth={clickAreaWidth}
            style={{ cursor: 'pointer' }}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </g>
    </svg>
  );
};

export default React.memo(Arrow);