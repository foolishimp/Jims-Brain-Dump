interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showOpenFilePicker(options?: { types: { description: string; accept: { [key: string]: string[] } }[] }): Promise<FileSystemFileHandle[]>;
  showSaveFilePicker(options?: { suggestedName?: string; types?: { description: string; accept: { [key: string]: string[] } }[] }): Promise<FileSystemFileHandle>;
}