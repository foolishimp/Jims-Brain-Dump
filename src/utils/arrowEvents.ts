import { Arrow, EventLogEntry } from '../types';

interface State {
  arrows: Arrow[];
}

export const arrowEventHandlers = {
  undo: (event: EventLogEntry, state: State): State => {
    switch (event.action) {
      case 'CREATE':
        return {
          ...state,
          arrows: state.arrows.filter(a => a.id !== event.data.id),
        };
      case 'DELETE':
        return {
          ...state,
          arrows: [...state.arrows, event.data],
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
          arrows: [...state.arrows, event.data],
        };
      case 'DELETE':
        return {
          ...state,
          arrows: state.arrows.filter(a => a.id !== event.data.id),
        };
      default:
        return state;
    }
  },
};