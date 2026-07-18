import { useEffect, useMemo, useState } from 'react';
import { FolderPlus, ArrowLeft, RefreshCw, FilePlus2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EntryCard } from '../components/EntryCard';
import { Modal } from '../components/Modal';
import { fileService } from '../services/api';
import type { FileEntry } from '../types';
import { useApi } from '../hooks/useApi';
import { useAppContext } from '../contexts/AppContext';

function normalizePath(path: string) {
  if (!path || path === '.') return '.';
  return path.replace(/\\/g, '/');
}

export function BrowsePage() {
  const navigate = useNavigate();
  const { currentPath, setCurrentPath, showToast } = useAppContext();
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [renameTarget, setRenameTarget] = useState<FileEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { loading, error, execute } = useApi<unknown>();

  const loadEntries = async (path = currentPath) => {
    const data = await execute(async () => fileService.listDirectory(path), {
      onSuccess: (result) => {
        setEntries(result as FileEntry[]);
        setCurrentPath(path);
      },
    });

    if (!data) {
      setEntries([]);
    }
  };

  useEffect(() => {
    void loadEntries(currentPath);
  }, [currentPath]);

  const goToParent = () => {
    const parent = currentPath === '.' ? '.' : currentPath.split('/').slice(0, -1).join('/') || '.';
    setCurrentPath(parent);
    void loadEntries(parent);
  };

  const openEntry = (entry: FileEntry) => {
    if (entry.isDirectory) {
      const nextPath = normalizePath(`${currentPath}/${entry.name}`);
      setCurrentPath(nextPath);
      void loadEntries(nextPath);
      return;
    }

    if (!entry.isDirectory) {
      navigate(`/file?path=${encodeURIComponent(entry.path)}`);
      return;
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast('Folder name is required', 'error');
      return;
    }

    await execute(async () => fileService.createDirectory(currentPath, newFolderName.trim()), {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewFolderName('');
        showToast('Folder created', 'success');
        void loadEntries(currentPath);
      },
    });
  };

  const handleCreateFile = async () => {
    const fileName = (newFileName || selectedFile?.name || '').trim();
    if (!fileName) {
      showToast('File name is required', 'error');
      return;
    }

    const content = selectedFile ? await selectedFile.text() : newFileContent;

    await execute(async () => fileService.createFile(currentPath, fileName, content), {
      onSuccess: () => {
        setShowUploadModal(false);
        setNewFileName('');
        setNewFileContent('');
        setSelectedFile(null);
        showToast('File created', 'success');
        void loadEntries(currentPath);
      },
    });
  };

  const handleRename = async () => {
    if (!renameTarget) return;

    const newName = window.prompt('Enter new name', renameTarget.name);
    if (!newName || !newName.trim()) return;

    await execute(async () => fileService.renameEntry(renameTarget.path, newName.trim(), renameTarget.isDirectory ? 'directory' : 'file'), {
      onSuccess: () => {
        setRenameTarget(null);
        showToast('Renamed successfully', 'success');
        void loadEntries(currentPath);
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const confirmed = window.confirm(`Delete ${deleteTarget.name}?`);
    if (!confirmed) return;

    await execute(async () => fileService.deleteEntry(deleteTarget.path, deleteTarget.isDirectory ? 'directory' : 'file'), {
      onSuccess: () => {
        setDeleteTarget(null);
        showToast('Deleted successfully', 'success');
        void loadEntries(currentPath);
      },
    });
  };

  const handleDownload = async (entry: FileEntry) => {
    try {
      const response = await fileService.readFile(entry.path);
      const content = response?.data?.content || '';
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = entry.name;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to download file', 'error');
    }
  };

  const summary = useMemo(() => ({
    folders: entries.filter((entry) => entry.isDirectory).length,
    files: entries.filter((entry) => !entry.isDirectory).length,
  }), [entries]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Files & folders</p>
          <h2>Browse your storage</h2>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={() => void loadEntries(currentPath)}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="primary-button" onClick={() => setShowCreateModal(true)}>
            <FolderPlus size={16} /> New folder
          </button>
          <button className="primary-button" onClick={() => setShowUploadModal(true)}>
            <FilePlus2 size={16} /> New file
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <strong>{summary.folders}</strong>
          <span>Folders</span>
        </div>
        <div className="stat-card">
          <strong>{summary.files}</strong>
          <span>Files</span>
        </div>
      </div>

      <div className="toolbar">
        <button className="ghost-button" onClick={goToParent}>
          <ArrowLeft size={16} /> Parent folder
        </button>
      </div>

      {loading ? <div className="state-card">Loading…</div> : null}
      {error ? <div className="state-card error">{error}</div> : null}
      {!loading && !error && entries.length === 0 ? <div className="state-card">This folder is empty.</div> : null}

      <div className="entries-grid">
        {entries.map((entry) => (
          <EntryCard key={entry.path} entry={entry} onOpen={openEntry} onRename={(item) => setRenameTarget(item)} onDelete={(item) => setDeleteTarget(item)} onDownload={handleDownload} />
        ))}
      </div>

      {renameTarget ? (
        <Modal title="Rename item" onClose={() => setRenameTarget(null)} actions={<><button className="secondary-button" onClick={() => setRenameTarget(null)}>Cancel</button><button className="primary-button" onClick={() => void handleRename()}>Save</button></>}>
          <label className="field-label">
            New name
            <input className="input" defaultValue={renameTarget.name} onChange={(event) => { renameTarget.name = event.target.value; }} />
          </label>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="Delete item" onClose={() => setDeleteTarget(null)} actions={<><button className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-button" onClick={() => void handleDelete()}>Delete</button></>}>
          <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
        </Modal>
      ) : null}

      {showCreateModal ? (
        <Modal title="Create folder" onClose={() => setShowCreateModal(false)} actions={<><button className="secondary-button" onClick={() => setShowCreateModal(false)}>Cancel</button><button className="primary-button" onClick={() => void handleCreateFolder()}>Create</button></>}>
          <label className="field-label">
            Folder name
            <input className="input" value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} />
          </label>
        </Modal>
      ) : null}

      {showUploadModal ? (
        <Modal title="Upload file" onClose={() => setShowUploadModal(false)} actions={<><button className="secondary-button" onClick={() => setShowUploadModal(false)}>Cancel</button><button className="primary-button" onClick={() => void handleCreateFile()}>Create</button></>}>
          <label className="field-label">
            Choose a file from your device
            <input className="input" type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          </label>
          <label className="field-label">
            File name
            <input className="input" value={newFileName} onChange={(event) => setNewFileName(event.target.value)} placeholder={selectedFile?.name || 'my-file.txt'} />
          </label>
          {!selectedFile ? (
            <label className="field-label">
              Content
              <textarea className="input textarea" value={newFileContent} onChange={(event) => setNewFileContent(event.target.value)} />
            </label>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}
