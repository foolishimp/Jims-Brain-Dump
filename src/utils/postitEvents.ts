import { Postit, Arrow, EventLogEntry } from '../types';

interface State {
  postits: Postit[];
  arrows: Arrow[];
}

export const postitEventHandlers = {
  undo: (event: EventLogEntry, state: State): State => {
    switch (event.action) {
      case 'CREATE':
        return {
          ...state,
          postits: state.postits.filter(p => p.id !== event.data.id),
        };
      case 'MOVE':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, x: event.data.oldX, y: event.data.oldY } : p
          ),
        };
      case 'EDIT':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, text: event.data.oldText } : p
          ),
        };
      case 'CHANGE_COLOR':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, color: event.data.oldColor } : p
          ),
        };
      case 'DELETE':
        return {
          ...state,
          postits: [...state.postits, event.data.postit],
          arrows: [...state.arrows, ...event.data.connectedArrows],
        };
      default:
        return state;
    }
  },
  redo: (event: EventLogEntry, state: State): State => {
    switch (event.action) {
      case 'CREATE':
        return {
          ...state,
          postits: [...state.postits, event.data],
        };
      case 'MOVE':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, x: event.data.newX, y: event.data.newY } : p
          ),
        };
      case 'EDIT':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, text: event.data.newText } : p
          ),
        };
      case 'CHANGE_COLOR':
        return {
          ...state,
          postits: state.postits.map(p =>
            p.id === event.data.id ? { ...p, color: event.data.newColor } : p
          ),
        };
      case 'DELETE':
        return {
          ...state,
          postits: state.postits.filter(p => p.id !== event.data.postit.id),
          arrows: state.arrows.filter(a => !event.data.connectedArrows.some((ca: Arrow) => ca.id === a.id)),
        };
      default:
        return state;
    }
  },
};