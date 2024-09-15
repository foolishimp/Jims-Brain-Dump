import { Postit, Arrow } from '../types';

interface DiagramData {
  postits: Postit[];
  arrows: Arrow[];
}

export const importDiagram = async (): Promise<{ filename: string; data: DiagramData }> => {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      }],
    });
    const file = await fileHandle.getFile();
    const content = await file.text();
    const diagramData = JSON.parse(content) as DiagramData;
    return {
      filename: fileHandle.name.replace('.json', ''),
      data: diagramData
    };
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to load the file:', err);
      throw err;
    }
    throw err;
  }
};

export const loadAutoSavedDiagram = (filename: string, index: number): DiagramData | null => {
  const autoSaveFilename = `auto-${filename}-${String(index).padStart(2, '0')}.json`;
  const autoSaveData = localStorage.getItem(autoSaveFilename);
  
  if (autoSaveData) {
    return JSON.parse(autoSaveData) as DiagramData;
  }
  
  return null;
};