import { Postit } from '../types';

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