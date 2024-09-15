import React, { createContext, useContext, useState, useCallback } from 'react';

interface CanvasState {
  zoom: number;
  position: { x: number; y: number };
}

interface CanvasContextType extends CanvasState {
  setZoom: (zoom: number) => void;
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasToScreenCoordinates: (x: number, y: number) => { x: number; y: number };
  screenToCanvasCoordinates: (x: number, y: number) => { x: number; y: number };
  updateCanvasState: (newState: Partial<CanvasState>) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    position: { x: 0, y: 0 },
  });

  const setZoom = useCallback((newZoom: number) => {
    setCanvasState((prev) => ({ ...prev, zoom: newZoom }));
  }, []);

  const setPosition = useCallback((newPosition: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setCanvasState((prev) => ({
      ...prev,
      position: typeof newPosition === 'function' ? newPosition(prev.position) : newPosition,
    }));
  }, []);

  const canvasToScreenCoordinates = useCallback((x: number, y: number) => ({
    x: x * canvasState.zoom + canvasState.position.x,
    y: y * canvasState.zoom + canvasState.position.y,
  }), [canvasState]);

  const screenToCanvasCoordinates = useCallback((x: number, y: number) => ({
    x: (x - canvasState.position.x) / canvasState.zoom,
    y: (y - canvasState.position.y) / canvasState.zoom,
  }), [canvasState]);

  const updateCanvasState = useCallback((newState: Partial<CanvasState>) => {
    setCanvasState((prev) => ({ ...prev, ...newState }));
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        ...canvasState,
        setZoom,
        setPosition,
        canvasToScreenCoordinates,
        screenToCanvasCoordinates,
        updateCanvasState,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};