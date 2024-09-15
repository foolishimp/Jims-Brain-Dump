import { useState, useCallback, useMemo, useRef } from 'react';
import { ZoomParams } from '../types';

interface Position {
  x: number;
  y: number;
}

const DEFAULT_ZOOM_PARAMS: ZoomParams = {
  minZoom: 0.1,
  maxZoom: 3,
  zoomFactor: 1.1
};

const useZoom = (initialZoom: number = 1, initialPosition: Position = { x: 0, y: 0 }, customZoomParams: Partial<ZoomParams> = {}) => {
  const zoomParams = useMemo(() => ({ ...DEFAULT_ZOOM_PARAMS, ...customZoomParams }), [customZoomParams]);
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState(initialPosition);
  const initialFocalPoint = useRef<Position | null>(null);
  const zoomTimeout = useRef<number | null>(null);

  const handleZoomStart = useCallback((mouseX: number, mouseY: number) => {
    if (!initialFocalPoint.current) {
      initialFocalPoint.current = {
        x: (mouseX - position.x) / zoom,
        y: (mouseY - position.y) / zoom
      };
    }
  }, [position, zoom]);

  const handleZoomEnd = useCallback(() => {
    if (zoomTimeout.current) {
      clearTimeout(zoomTimeout.current);
    }
    zoomTimeout.current = window.setTimeout(() => {
      initialFocalPoint.current = null;
    }, 200); // Adjust this delay as needed
  }, []);

  const handleZoom = useCallback((delta: number, mouseX: number, mouseY: number) => {
    handleZoomStart(mouseX, mouseY);

    setZoom((prevZoom) => {
      const factor = delta > 0 ? zoomParams.zoomFactor : 1 / zoomParams.zoomFactor;
      const newZoom = Math.max(zoomParams.minZoom, Math.min(zoomParams.maxZoom, prevZoom * factor));

      setPosition((prevPosition) => {
        const focalPoint = initialFocalPoint.current;
        if (focalPoint) {
          return {
            x: mouseX - focalPoint.x * newZoom,
            y: mouseY - focalPoint.y * newZoom
          };
        }
        return prevPosition;
      });

      return newZoom;
    });

    handleZoomEnd();
  }, [zoomParams, handleZoomStart, handleZoomEnd]);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setPosition((prevPosition) => ({
      x: prevPosition.x + deltaX,
      y: prevPosition.y + deltaY,
    }));
    initialFocalPoint.current = null;
  }, []);

  return { zoom, position, handleZoom, handlePan };
};

export default useZoom;