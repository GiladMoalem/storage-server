import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, FileText, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fileService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAppContext } from '../contexts/AppContext';

function getParentPath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return '.';
  }

  return parts.slice(0, -1).join('/');
}

function getFileName(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.split('/').filter(Boolean).pop() || filePath;
}

export function FileViewerPage() {
  const [searchParams] = useSearchParams();
  const filePath = searchParams.get('path') || '';
  const { showToast } = useAppContext();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Text file');

  const { loading, error, execute } = useApi<unknown>();

  const normalizedPath = useMemo(() => filePath || '', [filePath]);

  useEffect(() => {
    if (!normalizedPath) return;

    void execute(async () => fileService.readFile(normalizedPath), {
      onSuccess: (result) => {
        const payload = result as { data?: { content?: string } };
        setContent(payload?.data?.content || '');
        setTitle(getFileName(normalizedPath));
      },
      onError: () => {
        showToast('Unable to load file content', 'error');
      },
    });
  }, [normalizedPath]);

  const handleSave = async () => {
    if (!normalizedPath) {
      showToast('No file selected', 'error');
      return;
    }

    const parentPath = getParentPath(normalizedPath);
    const fileName = getFileName(normalizedPath);

    await execute(async () => fileService.createFile(parentPath, fileName, content), {
      onSuccess: () => {
        showToast('File updated successfully', 'success');
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Unable to save file', 'error');
      },
    });
  };

  if (!normalizedPath) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Text editor</p>
            <h2>No file selected</h2>
          </div>
          <Link className="secondary-button" to="/">
            <ArrowLeft size={16} /> Back to files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Text editor</p>
          <h2>{title}</h2>
          <p className="muted">{normalizedPath}</p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button" to="/">
            <ArrowLeft size={16} /> Back
          </Link>
          <button className="primary-button" onClick={() => void handleSave()}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {loading ? <div className="state-card">Loading content…</div> : null}
      {error ? <div className="state-card error">{error}</div> : null}

      <div className="editor-card">
        <div className="editor-toolbar">
          <div className="editor-badge">
            <FileText size={16} /> Plain text
          </div>
          <button className="secondary-button" onClick={() => void execute(async () => fileService.readFile(normalizedPath), { onSuccess: (result) => { const payload = result as { data?: { content?: string } }; setContent(payload?.data?.content || ''); showToast('Content refreshed', 'success'); } })}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <textarea className="editor-textarea" value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} />
      </div>
    </div>
  );
}
