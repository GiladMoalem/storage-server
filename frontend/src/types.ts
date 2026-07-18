export interface FileEntry {
  name: string;
  path: string;
  size: number;
  blksize: number;
  isDirectory: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code: string;
  };
}

export interface DirectoryViewState {
  entries: FileEntry[];
  currentPath: string;
}
