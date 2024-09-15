import React, { useState, useCallback, useEffect, useRef } from 'react';
import useZoom from '../hooks/useZoom';
import { ZoomParams } from '../types';

interface InfiniteCanvasProps {
  children: React.ReactNode | ((props: { zoom: number; position: { x: number; y: number } }) => React.ReactNode);
  onDoubleClick?: (event: React.MouseEvent, zoom: number, position: { x: number; y: number }) => void;
  disablePanZoom?: boolean;
  zoomParams?: ZoomParams;
  topOffset?: number;
  initialZoom?: number;
}

const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  onDoubleClick,
  disablePanZoom,
  zoomParams,
  topOffset = 0,
  initialZoom = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { zoom, position, handleZoom, handlePan } = useZoom(initialZoom, { x: 0, y: 0 }, zoomParams);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disablePanZoom) return;
    if (e.button === 0) {
      setIsDragging(true);
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  }, [disablePanZoom]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (disablePanZoom || !isDragging) return;
    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;
    handlePan(deltaX, deltaY);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  }, [disablePanZoom, isDragging, lastMousePosition, handlePan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (disablePanZoom) return;
    e.preventDefault();
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1 : -1;
      handleZoom(delta, mouseX, mouseY);
    }
  }, [disablePanZoom, handleZoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (onDoubleClick && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / zoom;
      const y = (e.clientY - rect.top - position.y) / zoom;
      onDoubleClick(e, zoom, { x, y });
    }
  }, [onDoubleClick, zoom, position]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: `calc(100vh - ${topOffset}px)`,
        marginTop: `${topOffset}px`,
        overflow: 'hidden',
        cursor: disablePanZoom ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove as any}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform',
        }}
      >
        {typeof children === 'function' ? children({ zoom, position }) : children}
      </div>
    </div>
  );
};

export default InfiniteCanvas;