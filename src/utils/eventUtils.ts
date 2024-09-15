import { EventLog } from '../types';

export const checkForNewEvents = (eventLog: EventLog, lastAutoSaveEventLogLength: number): boolean => {
  const currentEventLogLength = eventLog.past.length + eventLog.currentSequence.length;
  return currentEventLogLength > lastAutoSaveEventLogLength;
};