import React, { createContext, useContext, useState } from 'react';

interface CanvasContextType {
  zoom: number;
  position: { x: number; y: number };
  setZoom: (zoom: number) => void;
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasToScreenCoordinates: (x: number, y: number) => { x: number; y: number };
  screenToCanvasCoordinates: (x: number, y: number) => { x: number; y: number };
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const canvasToScreenCoordinates = (x: number, y: number) => ({
    x: x * zoom + position.x,
    y: y * zoom + position.y,
  });

  const screenToCanvasCoordinates = (x: number, y: number) => ({
    x: (x - position.x) / zoom,
    y: (y - position.y) / zoom,
  });

  return (
    <CanvasContext.Provider value={{ zoom, position, setZoom, setPosition, canvasToScreenCoordinates, screenToCanvasCoordinates }}>
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