import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BrowsePage } from './pages/BrowsePage';
import { FileViewerPage } from './pages/FileViewerPage';
import { AppProvider } from './contexts/AppContext';

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/upload" element={<BrowsePage />} />
          <Route path="/create" element={<BrowsePage />} />
          <Route path="/file" element={<FileViewerPage />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}
