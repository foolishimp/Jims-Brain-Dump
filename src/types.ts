export interface Postit {
    id: string;
    x: number;
    y: number;
    text: string;
    isEditing: boolean;
    color?: string;
  }
  
  export interface Arrow {
    id: string;
    startId: string;
    endId: string;
    startPosition: string;
    endPosition: string;
  }
  
  export interface EventLogEntry {
    target: string;
    action: string;
    data: any;
  }
  
  export interface EventLog {
    past: EventLogEntry[];
    future: EventLogEntry[];
    currentSequence: EventLogEntry[];
    lastEventType: string | null;
  }
  
  export interface ZoomParams {
    minZoom: number;
    maxZoom: number;
    zoomFactor: number;
  }