import type { FileEntry } from '../types';

const apiBase = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Request failed');
  }

  return payload as T;
}

export const fileService = {
  listDirectory: (relativePath: string) =>
    request<FileEntry[]>(`/directory?path=${encodeURIComponent(relativePath)}`),
  createDirectory: (relativePath: string, name: string) =>
    request<{ message?: string }>(`/directory?path=${encodeURIComponent(relativePath)}`, {
      method: 'POST',
      body: JSON.stringify({ dir_name: name }),
    }),
  renameEntry: (relativePath: string, newName: string, kind: 'directory' | 'file') =>
    request<{ message?: string }>(`/${kind}?path=${encodeURIComponent(relativePath)}`, {
      method: 'PUT',
      body: JSON.stringify(kind === 'directory' ? { new_dir_name: newName } : { new_file_name: newName }),
    }),
  deleteEntry: (relativePath: string, kind: 'directory' | 'file') =>
    request<{ message?: string }>(`/${kind}?path=${encodeURIComponent(relativePath)}`, {
      method: 'DELETE',
    }),
  createFile: (relativePath: string, fileName: string, data: string) =>
    request<{ message?: string }>(`/file?path=${encodeURIComponent(relativePath)}`, {
      method: 'POST',
      body: JSON.stringify({ file_name: fileName, data }),
    }),
  readFile: (relativePath: string) =>
    request<{ data: { content: string } }>(`/file?path=${encodeURIComponent(relativePath)}`),
};

export type { FileEntry } from '../types';
