import { EventLog, EventLogEntry } from '../types';
import { postitEventHandlers } from './postitEvents';
import { arrowEventHandlers } from './arrowEvents';

const MAX_LOG_SIZE = 100;

const EVENT_GRANULARITY: Record<string, number> = {
  'Postit.MOVE': 10,
  'Postit.EDIT': 3,
  'Arrow.MOVE': 5,
};

export const createEventLog = (): EventLog => ({
  past: [],
  future: [],
  currentSequence: [],
  lastEventType: null,
});

export const logEvent = (eventLog: EventLog, event: EventLogEntry): EventLog => {
  const { past, currentSequence, lastEventType } = eventLog;
  const eventType = `${event.target}.${event.action}`;
  const granularity = EVENT_GRANULARITY[eventType] || 1;

  let newPast = past;
  let newCurrentSequence = currentSequence;

  if (eventType !== lastEventType) {
    if (currentSequence.length > 0) {
      newPast = [...past.slice(-MAX_LOG_SIZE + 1), currentSequence[currentSequence.length - 1]];
    }
    newCurrentSequence = [event];
  } else {
    newCurrentSequence = [...currentSequence, event];
    if (newCurrentSequence.length >= granularity) {
      newPast = [...past.slice(-MAX_LOG_SIZE + 1), newCurrentSequence[newCurrentSequence.length - 1]];
      newCurrentSequence = [];
    }
  }

  return {
    past: newPast,
    future: [],
    currentSequence: newCurrentSequence,
    lastEventType: eventType,
  };
};

export const undo = (eventLog: EventLog, currentState: any): { eventLog: EventLog; newState: any } => {
  const { past, future, currentSequence } = eventLog;
  if (past.length === 0 && currentSequence.length === 0) return { eventLog, newState: currentState };

  let newPast, newFuture, previousEvent;

  if (currentSequence.length > 0) {
    previousEvent = currentSequence[0];
    newPast = past;
    newFuture = [previousEvent, ...future];
  } else {
    previousEvent = past[past.length - 1];
    newPast = past.slice(0, past.length - 1);
    newFuture = [previousEvent, ...future];
  }

  return {
    eventLog: {
      past: newPast,
      future: newFuture,
      currentSequence: [],
      lastEventType: null,
    },
    newState: undoEvent(previousEvent, currentState),
  };
};

export const redo = (eventLog: EventLog, currentState: any): { eventLog: EventLog; newState: any } => {
  const { past, future } = eventLog;
  if (future.length === 0) return { eventLog, newState: currentState };

  const next = future[0];
  const newFuture = future.slice(1);

  return {
    eventLog: {
      past: [...past, next],
      future: newFuture,
      currentSequence: [],
      lastEventType: null,
    },
    newState: redoEvent(next, currentState),
  };
};

const undoEvent = (event: EventLogEntry, currentState: any): any => {
  const handler = getEventHandler(event.target, 'undo');
  return handler ? handler(event, currentState) : currentState;
};

const redoEvent = (event: EventLogEntry, currentState: any): any => {
  const handler = getEventHandler(event.target, 'redo');
  return handler ? handler(event, currentState) : currentState;
};

const getEventHandler = (target: string, action: 'undo' | 'redo'): ((event: EventLogEntry, state: any) => any) | null => {
  switch (target) {
    case 'Postit':
      return postitEventHandlers[action];
    case 'Arrow':
      return arrowEventHandlers[action];
    default:
      console.warn(`No event handler found for target: ${target}`);
      return null;
  }
};