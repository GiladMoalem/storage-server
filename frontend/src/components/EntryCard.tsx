import { Folder, FileText, Pencil, Trash2, Download } from 'lucide-react';
import type { FileEntry } from '../types';

interface EntryCardProps {
  entry: FileEntry;
  onOpen: (entry: FileEntry) => void;
  onRename: (entry: FileEntry) => void;
  onDelete: (entry: FileEntry) => void;
  onDownload: (entry: FileEntry) => void;
}

export function EntryCard({ entry, onOpen, onRename, onDelete, onDownload }: EntryCardProps) {
  return (
    <div className="entry-card">
      <div className="entry-main" onClick={() => onOpen(entry)}>
        {entry.isDirectory ? <Folder size={24} className="icon folder" /> : <FileText size={24} className="icon file" />}
        <div>
          <h3>{entry.name}</h3>
          <p>{entry.isDirectory ? 'Directory' : 'File'}</p>
        </div>
      </div>
      <div className="entry-actions">
        {!entry.isDirectory ? (
          <button className="icon-button" onClick={() => onDownload(entry)} aria-label={`Download ${entry.name}`}>
            <Download size={16} />
          </button>
        ) : null}
        <button className="icon-button" onClick={() => onRename(entry)} aria-label={`Rename ${entry.name}`}>
          <Pencil size={16} />
        </button>
        <button className="icon-button danger" onClick={() => onDelete(entry)} aria-label={`Delete ${entry.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
