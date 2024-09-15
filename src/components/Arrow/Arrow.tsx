import React, { useCallback } from 'react';

interface ArrowProps {
  id?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
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
  isSelected, 
  onClick, 
  isTemporary = false 
}) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!isTemporary && onClick && id) {
      event.stopPropagation();
      onClick(id);
    }
  }, [onClick, id, isTemporary]);

  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx);

  const arrowHeadSize = 10;
  const strokeWidth = isSelected ? 3 : 2;

  return (
    <g onClick={handleClick} style={{ cursor: isTemporary ? 'default' : 'pointer' }}>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <polygon
        points={`0,-${arrowHeadSize / 2} ${arrowHeadSize},0 0,${arrowHeadSize / 2}`}
        fill={color}
        transform={`translate(${endX},${endY}) rotate(${angle * 180 / Math.PI})`}
      />
    </g>
  );
};

export default React.memo(Arrow);