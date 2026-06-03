import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { About } from './components/About';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracker } from './components/ComplaintTracker';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { Complaint, ToastMessage } from './types';
import { DEFAULT_COMPLAINTS } from './constants';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Initial State Load with Local Caching
  useEffect(() => {
    try {
      const cached = localStorage.getItem('denuncias');
      if (cached) {
        setComplaints(JSON.parse(cached));
      } else {
        // Hydrate with high-fidelity mock complaints representing actual problems in Leme/SP
        localStorage.setItem('denuncias', JSON.stringify(DEFAULT_COMPLAINTS));
        setComplaints(DEFAULT_COMPLAINTS);
      }
    } catch (err) {
      console.error('Falha ao processar cache de armazenamento local:', err);
      setComplaints(DEFAULT_COMPLAINTS);
    }
  }, []);

  // 2. Add new complaint securely
  const handleAddComplaint = async (newComplaint: Complaint) => {
    const updated = [newComplaint, ...complaints];
    setComplaints(updated);
    try {
      localStorage.setItem('denuncias', JSON.stringify(updated));
    } catch (err) {
      console.error('Erro ao gravar a denúncia no cache local:', err);
    }

    // Auto-sync with Google Sheets if configured and enabled
    try {
      const isAutoSync = localStorage.getItem('sheets_auto_sync') === 'true';
      const sheetId = localStorage.getItem('sheets_spreadsheet_id');
      if (isAutoSync && sheetId) {
        const { getAccessToken } = await import('./lib/auth');
        const token = await getAccessToken();
        if (token) {
          const { syncSpreadsheetData } = await import('./lib/sheets');
          const result = await syncSpreadsheetData(token, sheetId, updated);
          if (result.changesMade) {
            setComplaints(result.updatedComplaints);
            localStorage.setItem('denuncias', JSON.stringify(result.updatedComplaints));
          }
          addToast('Denúncia sincronizada com Google Planilhas automaticamente!', 'success');
        }
      }
    } catch (err) {
      console.warn('Falha na sincronização automática em segundo plano com Google Sheets:', err);
    }
  };

  // 3. Dynamic toast feedback notifications
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatically remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Universal Skip to Content for Accessibility */}
      <a
        href="#denuncia"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase"
      >
        Ir Direto para o Formulário de Denúncia
      </a>

      {/* Primary Sticky Header */}
      <Header onFormNav={() => {
        const el = document.getElementById('denuncia');
        el?.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* Main Structural Layout Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          totalCount={complaints.length}
          onActionClick={(id) => {
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Features Lifecycle Steps */}
        <Features />

        {/* Dynamic Complaint Tracker & Transparency Mural Wall */}
        <ComplaintTracker complaints={complaints} addToast={addToast} onUpdateComplaints={(updated) => {
          setComplaints(updated);
          localStorage.setItem('denuncias', JSON.stringify(updated));
        }} />

        {/* About context, Neutrality & Legal Compliance warning */}
        <About />

        {/* Registration Submission Form */}
        <ComplaintForm onAddComplaint={handleAddComplaint} addToast={addToast} />
      </main>

      {/* Global Footer info */}
      <Footer />

      {/* Overlay Toast Center notifications panel */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
