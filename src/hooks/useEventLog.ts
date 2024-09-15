import { useState, useCallback } from 'react';
import { EventLog, EventLogEntry } from '../types';
import { createEventLog, logEvent, undo, redo } from '../utils/eventLogUtils';

interface State {
  postits: any[];
  arrows: any[];
}

const useEventLog = (initialState: State) => {
  const [eventLog, setEventLog] = useState<EventLog>(createEventLog());
  const [state, setState] = useState<State>(initialState);

  const handleEvent = useCallback((event: EventLogEntry) => {
    setEventLog((prevLog) => {
      const newLog = logEvent(prevLog, event);
      return newLog;
    });
    setState((prevState) => {
      // Apply the event to the state
      // This logic should match the logic in your handleEvent function in usePostitBoard
      let newState = { ...prevState };
      switch (event.target) {
        case 'Postit':
          // Apply postit event
          break;
        case 'Arrow':
          // Apply arrow event
          break;
        default:
          console.warn(`Unhandled event target: ${event.target}`);
      }
      return newState;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setEventLog((prevLog) => {
      const { eventLog: newLog, newState } = undo(prevLog, state);
      setState(newState);
      return newLog;
    });
  }, [state]);

  const handleRedo = useCallback(() => {
    setEventLog((prevLog) => {
      const { eventLog: newLog, newState } = redo(prevLog, state);
      setState(newState);
      return newLog;
    });
  }, [state]);

  return {
    eventLog,
    handleEvent,
    handleUndo,
    handleRedo,
    canUndo: eventLog.past.length > 0 || eventLog.currentSequence.length > 0,
    canRedo: eventLog.future.length > 0,
  };
};

export default useEventLog;