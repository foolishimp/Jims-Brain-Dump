import { Postit, Arrow } from '../types';

interface DiagramData {
  postits: Postit[];
  arrows: Arrow[];
}

type CoordinateConverter = (x: number, y: number) => { x: number; y: number };

export const importDiagram = async (
  screenToCanvasCoordinates: CoordinateConverter
): Promise<{ filename: string; data: DiagramData }> => {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      }],
    });
    const file = await fileHandle.getFile();
    const content = await file.text();
    const parsedData = JSON.parse(content) as DiagramData;

    // Convert screen coordinates to canvas coordinates
    const importedPostits = parsedData.postits.map(postit => ({
      ...postit,
      ...screenToCanvasCoordinates(postit.x, postit.y)
    }));

    return {
      filename: fileHandle.name.replace('.json', ''),
      data: {
        postits: importedPostits,
        arrows: parsedData.arrows
      }
    };
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to load the file:', err);
      throw err;
    }
    throw err;
  }
};

export const loadAutoSavedDiagram = (
  filename: string,
  index: number,
  screenToCanvasCoordinates: CoordinateConverter
): DiagramData | null => {
  const autoSaveFilename = `auto-${filename}-${String(index).padStart(2, '0')}.json`;
  const autoSaveData = localStorage.getItem(autoSaveFilename);
  
  if (autoSaveData) {
    const parsedData = JSON.parse(autoSaveData) as DiagramData;
    
    // Convert screen coordinates to canvas coordinates
    const importedPostits = parsedData.postits.map(postit => ({
      ...postit,
      ...screenToCanvasCoordinates(postit.x, postit.y)
    }));

    return {
      postits: importedPostits,
      arrows: parsedData.arrows
    };
  }
  
  return null;
};