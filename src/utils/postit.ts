import { Postit } from '../types';

export const POSTIT_WIDTH = 200;
export const POSTIT_HEIGHT = 150;

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const createNewPostit = (x: number, y: number, color: string): Postit => {
  return {
    id: generateId(),
    x,
    y,
    text: '',
    isEditing: true,
    color,
  };
};

export const parseMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

export interface ConnectionPoint {
  x: number;
  y: number;
  position: string;
}

export const getPostitConnectionPoints = (postit: Postit): ConnectionPoint[] => {
  if (!postit || typeof postit.x !== 'number' || typeof postit.y !== 'number') {
    console.error('Invalid postit:', postit);
    return [];
  }
  return [
    { x: postit.x + POSTIT_WIDTH / 2, y: postit.y, position: 'top' },
    { x: postit.x + POSTIT_WIDTH, y: postit.y + POSTIT_HEIGHT / 2, position: 'right' },
    { x: postit.x + POSTIT_WIDTH / 2, y: postit.y + POSTIT_HEIGHT, position: 'bottom' },
    { x: postit.x, y: postit.y + POSTIT_HEIGHT / 2, position: 'left' },
  ];
};

interface ConnectionPointWithDistance extends ConnectionPoint {
  distance: number;
}

export const getClosestConnectionPoint = (postit: Postit, x: number, y: number): ConnectionPoint | null => {
  const points = getPostitConnectionPoints(postit);
  if (points.length === 0) return null;
  return points.reduce((closest: ConnectionPointWithDistance, point: ConnectionPoint) => {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    return distance < closest.distance ? { ...point, distance } : closest;
  }, { ...points[0], distance: Infinity });
};