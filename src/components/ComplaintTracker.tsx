import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  User,
  Image,
  AlertCircle,
  ListFilter,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { CATEGORIES_MAP, STATUS_MAP } from '../constants';
import { CategoryIcon } from './CategoryIcon';
import { SheetsPanel } from './SheetsPanel';

interface ComplaintTrackerProps {
  complaints: Complaint[];
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onUpdateComplaints?: (updated: Complaint[]) => void;
}

export function ComplaintTracker({ complaints, addToast, onUpdateComplaints }: ComplaintTrackerProps) {
  // Protocol tracking states
  const [searchProtocol, setSearchProtocol] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Transparency wall states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<Complaint['status'] | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Carousel & responsive pagination states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768; // md breakpoint is 768px
  const itemsPerPage = isMobile ? 1 : 2;

  // Reset index when filters change to avoid getting lost in out-of-bound pages
  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Administrative protection states
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return localStorage.getItem('is_admin_unlocked') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin municipal code set to "leme2026"
    if (adminPassword.trim() === 'leme2026') {
      setIsAdminUnlocked(true);
      localStorage.setItem('is_admin_unlocked', 'true');
      setAdminPassword('');
      setShowAdminPrompt(false);
      addToast('Acesso administrativo autorizado com sucesso!', 'success');
    } else {
      addToast('Chave de acesso administrativa inválida.', 'error');
    }
  };

  const handleAdminLock = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('is_admin_unlocked');
    addToast('Painel administrativo bloqueado com sucesso.', 'info');
  };

  const handleProtocolSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanProtocol = searchProtocol.trim().toUpperCase();
    
    if (!cleanProtocol) {
      addToast('Por favor, informe um número de protocolo válido.', 'info');
      return;
    }

    const found = complaints.find((c) => c.protocolo === cleanProtocol);
    setTrackedComplaint(found || null);
    setHasSearched(true);

    if (found) {
      addToast('Denúncia encontrada!', 'success');
    } else {
      addToast('Protocolo não localizado na rede de Leme.', 'error');
    }
  };

  const toggleExpand = (protocolo: string) => {
    setExpandedId(expandedId === protocolo ? null : protocolo);
  };

  // Filter complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.protocolo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'all' || c.tipo === selectedCategory;
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [complaints, searchTerm, selectedCategory, selectedStatus]);

  const totalItems = filteredComplaints.length;
  const maxIndex = Math.max(0, totalItems - itemsPerPage);
  const clampedIndex = Math.min(currentIndex, maxIndex);

  const visibleComplaints = useMemo(() => {
    return filteredComplaints.slice(clampedIndex, clampedIndex + itemsPerPage);
  }, [filteredComplaints, clampedIndex, itemsPerPage]);

  // Compute dynamic stats dashboard metrics
  const stats = useMemo(() => {
    const total = complaints.length;
    const recebida = complaints.filter((c) => c.status === 'recebida').length;
    const analise = complaints.filter((c) => c.status === 'analise').length;
    const encaminhada = complaints.filter((c) => c.status === 'encaminhada').length;
    const resolvida = complaints.filter((c) => c.status === 'resolvida').length;
    const percentage = total > 0 ? Math.round((resolvida / total) * 100) : 0;
    return {
      total,
      recebida,
      analise,
      encaminhada,
      resolvida,
      resolvidaPercentage: percentage
    };
  }, [complaints]);

  // Timline stages for protocol status check
  const stages: { key: Complaint['status']; label: string; desc: string }[] = [
    { key: 'recebida', label: 'Registrada', desc: 'Queixa cadastrada no Portal.' },
    { key: 'analise', label: 'Em Triagem', desc: 'Avaliando consistência dos fatos.' },
    { key: 'encaminhada', label: 'Encaminhada', desc: 'Enviada aos órgãos competentes.' },
    { key: 'resolvida', label: 'Resolvida', desc: 'Ação resolutiva final concluída.' },
  ];

  const getStageIndex = (status: Complaint['status']): number => {
    return stages.findIndex((s) => s.key === status);
  };

  return (
    <div className="flex flex-col gap-20">
      
      {/* 1. CONSULTA DE STATUS INDIVIDUAL */}
      <section id="status" className="py-20 px-4 md:px-8 bg-neutral-950/80 border-t border-neutral-900 scroll-mt-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Header */}
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
              Rastreamento Seguro
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 mb-3">
              Consultar Situação da Queixa
            </h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
              Insira o protocolo eletrônico recebido para rastrear o andamento, as providências adotadas e as respostas públicas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleProtocolSearch} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 mb-10">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchProtocol}
                onChange={(e) => setSearchProtocol(e.target.value)}
                placeholder="Ex e formato: LEM-2026-4512"
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/60 rounded-xl px-4 py-3.5 pl-10 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              />
              <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:translate-y-0 text-sm"
            >
              Consultar Protocolo
            </button>
          </form>

          {/* Display Search Outcome */}
          <AnimatePresence mode="wait">
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto"
              >
                {trackedComplaint ? (
                  <div className="bg-neutral-950 p-6 md:p-8 rounded-2xl border border-neutral-900 text-left shadow-lg">
                    
                    {/* Upper Metadata Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-5 mb-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500 bg-blue-500/15 border border-blue-500/20 px-2.5 py-1 rounded-full">
                          {trackedComplaint.protocolo}
                        </span>
                        <h4 className="text-lg font-extrabold text-white mt-2 leading-tight">
                          {trackedComplaint.titulo}
                        </h4>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-neutral-500 block mb-1">Status Atual</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_MAP[trackedComplaint.status].colorClass} ${STATUS_MAP[trackedComplaint.status].bgClass} ${STATUS_MAP[trackedComplaint.status].borderClass}`}>
                          {STATUS_MAP[trackedComplaint.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Workflow Progress Timeline */}
                    <div className="mb-8 pt-2">
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">
                        Cronograma de Tramitação
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {/* Connecting background bar for desktop */}
                        <div className="hidden md:block absolute top-[18px] left-8 right-8 h-1 bg-neutral-900 z-0" />
                        
                        {stages.map((stage, idx) => {
                          const isCompleted = getStageIndex(trackedComplaint.status) >= idx;
                          const isCurrent = trackedComplaint.status === stage.key;
                          
                          return (
                            <div key={idx} className="flex md:flex-col gap-4 md:gap-3 items-center md:items-center relative z-10">
                              
                              {/* Step Badge */}
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all border ${
                                  isCompleted
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                                }`}
                              >
                                {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : idx + 1}
                              </div>

                              {/* Label Description */}
                              <div className="text-left md:text-center">
                                <h5 className={`text-sm font-bold leading-none ${isCurrent ? 'text-blue-400' : isCompleted ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                  {stage.label}
                                </h5>
                                <p className="text-neutral-500 text-[10px] leading-relaxed mt-1 hidden md:block">
                                  {stage.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inner facts details */}
                    <div className="bg-neutral-900/50 p-5 rounded-xl border border-neutral-900 flex flex-col gap-3 text-sm text-neutral-300">
                      <div className="flex gap-2 text-xs text-neutral-400">
                        <span className="font-extrabold text-neutral-300">Categoria:</span>
                        <span>{CATEGORIES_MAP[trackedComplaint.tipo].label}</span>
                      </div>
                      
                      <div className="flex gap-2 text-xs text-neutral-400">
                        <span className="font-extrabold text-neutral-300">Cidade:</span>
                        <span>Leme/SP — Bairro {trackedComplaint.bairro}</span>
                      </div>
                      
                      <div className="flex gap-2 text-xs text-neutral-400">
                        <span className="font-extrabold text-neutral-300">Local aproximado:</span>
                        <span>{trackedComplaint.rua}</span>
                      </div>

                      <div className="flex gap-2 text-xs text-neutral-400">
                        <span className="font-extrabold text-neutral-300">Data de Entrada:</span>
                        <span>{trackedComplaint.data}</span>
                      </div>

                      <div className="pt-3 border-t border-neutral-800/80 mt-2 text-neutral-400 text-xs italic leading-relaxed">
                        &quot;{trackedComplaint.descricao}&quot;
                      </div>

                      {/* Attached Image if exists */}
                      {(trackedComplaint.fotoBase64 || trackedComplaint.fotoUrl) && (
                        <div className="mt-4 pt-4 border-t border-neutral-850">
                          <p className="text-xs font-bold text-neutral-400 mb-2">Imagem em Anexo:</p>
                          <div className="max-w-xs rounded-xl overflow-hidden border border-neutral-800">
                            <img src={trackedComplaint.fotoBase64 || trackedComplaint.fotoUrl} alt="Evidência fotográfica" className="w-full h-auto object-cover" />
                          </div>
                          {trackedComplaint.fotoUrl && (
                            <a
                              href={trackedComplaint.fotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors text-[10px] font-mono mt-1.5 flex items-center gap-1 hover:underline"
                            >
                              Abrir foto no Google Drive ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-neutral-950 rounded-2xl border border-neutral-900 text-center text-neutral-500 text-sm">
                    <p className="font-extrabold text-neutral-300 mb-1 flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Nenhum registro localizado.
                    </p>
                    <p className="text-neutral-400">Certifique-se de digitar as iniciais e traços corretamente (ex: LEM-2026-XXXX).</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. PAINEL DE TRANSPARÊNCIA CÍVICA (MURAL PÚBLICO) */}
      <section id="transparencia" className="py-20 px-4 md:px-8 bg-neutral-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="text-left max-w-xl">
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
                Voz da Coletividade
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1.5 mb-3 leading-tight">
                Mural Público de Transparência
              </h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Toda queixa enviada alimenta essa central pública. Transparência plena e cidadania ativa fortalecidas sem filtros partidários.
              </p>
            </div>

            {/* Total Indicator Badge */}
            <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 h-fit md:text-right flex items-center gap-4 shrink-0 justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-bold tracking-wider mb-1">Demandas Coletivas</span>
                <span className="text-2xl font-black text-white">{filteredComplaints.length} listadas</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Painel de Contagem Automática (Painel de Status) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Registradas */}
            <div className="bg-neutral-900/30 border border-neutral-900/80 hover:border-neutral-800 p-5 rounded-2xl flex items-center justify-between transition-all group">
              <div className="text-left">
                <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block mb-1">Registradas</span>
                <span className="text-2xl md:text-3xl font-black text-white group-hover:text-neutral-300 transition-colors">{stats.recebida}</span>
                <span className="text-[10px] text-neutral-500 block mt-1">Triagem inicial</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center text-neutral-500 border border-neutral-900 shrink-0">
                <FileCheck className="w-5 h-5 text-neutral-400" />
              </div>
            </div>

            {/* Em Análise */}
            <div className="bg-neutral-900/30 border border-neutral-900/80 hover:border-amber-500/20 p-5 rounded-2xl flex items-center justify-between transition-all group">
              <div className="text-left">
                <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-wider block mb-1">Em Análise</span>
                <span className="text-2xl md:text-3xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.analise}</span>
                <span className="text-[10px] text-neutral-500 block mt-1">Avaliando os fatos</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            {/* Encaminhadas */}
            <div className="bg-neutral-900/30 border border-neutral-900/80 hover:border-blue-500/20 p-5 rounded-2xl flex items-center justify-between transition-all group">
              <div className="text-left">
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block mb-1">Encaminhadas</span>
                <span className="text-2xl md:text-3xl font-black text-white group-hover:text-blue-300 transition-colors">{stats.encaminhada}</span>
                <span className="text-[10px] text-neutral-500 block mt-1">Enviadas aos órgãos</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                <Send className="w-5 h-5" />
              </div>
            </div>

            {/* Resolvidas */}
            <div className="bg-neutral-900/30 border border-neutral-900/80 hover:border-emerald-500/20 p-5 rounded-2xl flex items-center justify-between transition-all group">
              <div className="text-left">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block mb-1">Resolvidas</span>
                <span className="text-2xl md:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors">{stats.resolvida}</span>
                <span className="text-[10px] text-emerald-550 font-semibold block mt-1">
                  {stats.resolvidaPercentage}% resolvidas
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-450" />
              </div>
            </div>
          </div>

          {/* Google Sheets Synchronization Panel (Protected Area) */}
          <div className="mb-10">
            {isAdminUnlocked ? (
              <div className="relative">
                {/* Admin Status Ribbon */}
                <div className="mb-3 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Modo Administrador Ativo — Chaves de criptografia e sincronização autenticadas.
                  </span>
                  <button
                    onClick={handleAdminLock}
                    className="px-3 py-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-bold rounded-lg transition-all text-[11px] cursor-pointer"
                  >
                    Encerrar Sessão
                  </button>
                </div>
                
                <SheetsPanel complaints={complaints} addToast={addToast} onUpdateComplaints={onUpdateComplaints} />
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-900/60 p-6 rounded-2xl transition-all duration-300 hover:border-neutral-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-805">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                        Painel de Controle Municipal
                        <span className="text-[9px] bg-neutral-900 text-neutral-500 font-mono px-1.5 py-0.5 rounded leading-none">RESTRITO</span>
                      </h4>
                      <p className="text-neutral-500 text-xs mt-0.5">Sincronização com o Google Drive de uso exclusivo da Ouvidoria e Ouvidor-Geral.</p>
                    </div>
                  </div>

                  {!showAdminPrompt ? (
                    <button
                      onClick={() => setShowAdminPrompt(true)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-300 border border-neutral-800 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start sm:self-center"
                    >
                      Acessar Ouvidoria Interna
                    </button>
                  ) : (
                    <form onSubmit={handleAdminAuth} className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Insira a chave de acesso..."
                        className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-48 placeholder-neutral-600"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all border border-emerald-500/20 cursor-pointer"
                      >
                        Entrar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminPrompt(false);
                          setAdminPassword('');
                        }}
                        className="text-neutral-500 hover:text-neutral-300 px-2 py-2 text-xs"
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filtering Control Panel */}
          <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-900 mb-8 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ListFilter className="w-4 h-4 text-blue-500" />
              <span>Painel de Filtros e Busca</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search by text */}
              <div className="md:col-span-5 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por bairro, título ou protocolo..."
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/60 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Filter by Category */}
              <div className="md:col-span-4 select-field">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ComplaintCategory | 'all')}
                  className="w-full bg-neutral-900 border border-neutral-805 hover:border-neutral-700/60 rounded-xl px-4 py-3 text-xs text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                >
                  <option value="all">Todas as Categorias</option>
                  {Object.entries(CATEGORIES_MAP).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="md:col-span-3 select-field">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Complaint['status'] | 'all')}
                  className="w-full bg-neutral-900 border border-neutral-805 hover:border-neutral-700/60 rounded-xl px-4 py-3 text-xs text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                >
                  <option value="all">Todos os Status</option>
                  {Object.entries(STATUS_MAP).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Controller */}
          {filteredComplaints.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-neutral-900/40 p-4 rounded-xl border border-neutral-900">
              <span className="text-xs text-neutral-400 font-medium">
                Visualizando <strong className="text-white">{clampedIndex + 1}</strong>-{Math.min(clampedIndex + itemsPerPage, totalItems)} de{' '}
                <strong className="text-blue-500 font-extrabold">{totalItems}</strong> denúncias enviadas
              </span>
              
              <div className="flex items-center gap-3">
                {/* Sleek indicator bar */}
                <div className="hidden sm:block w-32 bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${totalItems ? ((clampedIndex + itemsPerPage) / totalItems) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={clampedIndex === 0}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 disabled:opacity-35 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(totalItems - itemsPerPage, prev + 1))}
                    disabled={clampedIndex >= totalItems - itemsPerPage}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 disabled:opacity-35 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed"
                    title="Próximo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List of complaints in a carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleComplaints.length > 0 ? (
                visibleComplaints.map((c) => {
                  const isExpanded = expandedId === c.protocolo;
                  const categoryItem = CATEGORIES_MAP[c.tipo];
                  const statusItem = STATUS_MAP[c.status];

                  return (
                    <motion.div
                      key={c.protocolo}
                      layout="position"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-neutral-950 p-6 rounded-2xl border ${
                        isExpanded ? 'border-neutral-750 shadow-lg' : 'border-neutral-900 hover:border-neutral-800'
                      } flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}
                    >
                      <div>
                        {/* Upper Card Info Column */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-800/80">
                              {c.protocolo}
                            </span>
                            
                            <h3 className="font-extrabold text-base text-white mt-1.5 leading-snug">
                              {c.titulo}
                            </h3>
                          </div>

                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusItem.colorClass} ${statusItem.bgClass} ${statusItem.borderClass} shrink-0`}>
                            {statusItem.label}
                          </span>
                        </div>

                        {/* Middle Icons Row metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400 font-medium mb-4">
                          <div className="flex items-center gap-1">
                            <span className="p-1 rounded bg-neutral-900 text-blue-400">
                              <CategoryIcon category={c.tipo} className="w-3.5 h-3.5" />
                            </span>
                            <span>{categoryItem.label}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Bairro: {c.bairro}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{c.data.split(' ')[0]}</span>
                          </div>
                        </div>

                        {/* Collapsed Description Snippet */}
                        <p className={`text-neutral-400 text-sm leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {c.descricao}
                        </p>

                        {/* Expandable Box */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden border-t border-neutral-900 pt-4 mt-4 space-y-4 text-xs"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-400">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                                  <span><strong className="text-neutral-300">Local aproximado:</strong> {c.rua}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <span>
                                    <strong className="text-neutral-300">Segurança:</strong>{' '}
                                    Identidade Protegida (Cidadão Anônimo)
                                  </span>
                                </div>
                              </div>

                              {/* Uploaded Evidence Image inside Mural */}
                              {(c.fotoBase64 || c.fotoUrl) && (
                                <div className="pt-2 text-left">
                                  <span className="font-bold text-neutral-300 flex items-center gap-2 mb-2">
                                    <Image className="w-4 h-4 text-neutral-500" />
                                    Mídia anexada:
                                  </span>
                                  <div className="max-w-xs rounded-xl overflow-hidden border border-neutral-800">
                                    <img src={c.fotoBase64 || c.fotoUrl} alt="Foto Irregularidade" className="w-full h-auto object-cover" />
                                  </div>
                                  {c.fotoUrl && (
                                    <a
                                      href={c.fotoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-[11px] font-mono mt-1.5 inline-flex items-center gap-1 hover:underline"
                                    >
                                      Visualizar foto no Google Drive ↗
                                    </a>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Expand Action toggler button */}
                      <div className="border-t border-neutral-900/50 pt-4 mt-4 flex justify-end">
                        <button
                          onClick={() => toggleExpand(c.protocolo)}
                          className="text-xs font-bold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                        >
                          {isExpanded ? (
                            <>
                              Ocultar detalhes
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Ver detalhes completos
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-1 md:col-span-2 py-16 px-4 bg-neutral-950 rounded-2xl border border-neutral-900 text-center text-neutral-500 text-sm">
                  <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <p className="font-bold text-neutral-400">Nenhum registro corresponde aos filtros definidos.</p>
                  <p className="text-neutral-500 mt-1">Experimente remover termos de busca ou mudar a categoria selecionada.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
