import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Upload,
  X,
  PlusCircle,
  Copy,
  Check,
  MapPin,
  FileText,
  User,
  Phone,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../types';
import { CATEGORIES_MAP } from '../constants';
import { CategoryIcon } from './CategoryIcon';

interface ComplaintFormProps {
  onAddComplaint: (complaint: Complaint) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function ComplaintForm({ onAddComplaint, addToast }: ComplaintFormProps) {
  // Form states
  const [tipo, setTipo] = useState<ComplaintCategory | ''>('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [anonimo, setAnonimo] = useState(false);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission/Response states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProtocol, setCreatedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      addToast('A imagem selecionada excede o limite máximo de 10 MB.', 'error');
      return;
    }
    if (!selectedFile.type.startsWith('image/')) {
      addToast('Por favor, anexe apenas arquivos de imagem (JPEG, PNG).', 'error');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    addToast('Imagem adicionada com sucesso!', 'success');
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setFile(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Imagem removida.', 'info');
  };

  const handleCopyProtocol = () => {
    if (createdProtocol) {
      navigator.clipboard.writeText(createdProtocol);
      setCopied(true);
      addToast('Protocolo de denúncia copiado!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateProtocol = (): string => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    return `LEM-${year}-${randomNum}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tipo) {
      addToast('Por favor, selecione uma categoria para a denúncia.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate slight network delay for high fidelity experience
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const protocol = generateProtocol();

      const newComplaint: Complaint = {
        protocolo: protocol,
        tipo: tipo as ComplaintCategory,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        bairro: bairro.trim(),
        rua: rua.trim(),
        fotoBase64: preview || undefined,
        fotoNome: file?.name || undefined,
        nome: nome.trim(),
        contato: contato.trim() || undefined,
        anonimo,
        data: new Date().toLocaleString('pt-BR'),
        status: 'recebida',
      };

      // Register Complaint in the system!
      onAddComplaint(newComplaint);
      setCreatedProtocol(protocol);
      addToast('Denúncia enviada com sucesso ao Portal!', 'success');

      // Clear inputs
      setTipo('');
      setTitulo('');
      setDescricao('');
      setBairro('');
      setRua('');
      setNome('');
      setContato('');
      setAnonimo(false);
      setFile(null);
      setPreview('');
    } catch (err) {
      addToast('Houve um contratempo ao registrar sua queixa. Tente de novo.', 'error');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="denuncia" className="py-20 px-4 md:px-8 bg-neutral-900 border-t border-neutral-950 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">
            Canal Direto
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Registrar Nova Denúncia
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Seu relato é precioso para nossa comunidade. Siga o preenchimento seguro abaixo. Você pode optar por ocultar seu nome no mural público.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Panel Side (4-cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-neutral-950 to-neutral-900/40 p-8 rounded-2xl border border-neutral-800/80 lg:sticky lg:top-36">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl inline-flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              Privacidade Registrada &amp; Sigilo
            </h3>
            
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li className="flex gap-2 items-start">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                <span>Seu nome completo é obrigatório no formulário para triagem interna, mas será <strong>ocultado do público</strong> caso marque a caixa de anonimato.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                <span>As evidências visuais (fotos) aumentam a probabilidade de providência pelo órgão público local em até <strong>4x</strong>.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                <span>Após o envio bem-sucedido, será gerado um protocolo eletrônico para rastreio em nosso site.</span>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-neutral-800 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-neutral-400 font-medium">Servidor SSL e conexões encriptadas</span>
            </div>
          </div>

          {/* Form Container (8-cols) */}
          <div className="lg:col-span-8 bg-neutral-950 p-6 md:p-8 rounded-2xl border border-neutral-900 shadow-md">
            
            {/* Modal de Sucesso no Envio */}
            <AnimatePresence>
              {createdProtocol && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8 p-6 bg-gradient-to-r from-blue-900/10 to-emerald-950/25 border border-emerald-500/20 rounded-xl relative overflow-hidden"
                >
                  <button
                    onClick={() => setCreatedProtocol(null)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1"
                    aria-label="Agrupar aviso"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        Denúncia Gravada com Sucesso!
                      </h4>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                        O protocolo gerado para este requerimento já está registrado localmente no seu navegador. Salve o código para consultas futuras no painel.
                      </p>

                      <div className="flex items-center gap-2 max-w-sm">
                        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl font-mono text-white text-lg tracking-wider font-extrabold flex-1 text-center">
                          {createdProtocol}
                        </div>
                        <button
                          onClick={handleCopyProtocol}
                          type="button"
                          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all font-semibold shadow-md active:scale-95 flex items-center justify-center"
                          title="Copiar Protocolo"
                        >
                          {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Seção 1: Demanda */}
              <div>
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Sobre a Reclamação
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Categoria */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-tipo" className="text-sm font-extrabold text-neutral-200">
                      Categoria da Ocorrência <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="form-tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as ComplaintCategory)}
                        required
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl px-4 py-3.5 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                      >
                        <option value="">Selecione para classificar...</option>
                        {Object.entries(CATEGORIES_MAP).map(([key, item]) => (
                          <option key={key} value={key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-xs">
                        {tipo ? (
                          <CategoryIcon category={tipo as ComplaintCategory} className="w-4 h-4 text-blue-400" />
                        ) : (
                          '▼'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-titulo" className="text-sm font-extrabold text-neutral-200">
                      Título Simplificado <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="form-titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Vazamento constante na calçada da UBS"
                        required
                        maxLength={120}
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FileText className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-2 mt-4">
                  <label htmlFor="form-descricao" className="text-sm font-extrabold text-neutral-200">
                    Relato Detalhado <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="form-descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva minuciosamente o problema constatado. Quando percebeu pela primeira vez? Oferece riscos iminentes a pedestres ou automóveis?"
                    required
                    rows={4}
                    className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Seção 2: Localização */}
              <div className="pt-4 border-t border-neutral-900">
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Localização Aproximada
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bairro */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-bairro" className="text-sm font-extrabold text-neutral-200">
                      Bairro de Leme/SP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="form-bairro"
                        type="text"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        placeholder="Ex: Jardim São Paulo"
                        required
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <MapPin className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-rua" className="text-sm font-extrabold text-neutral-200">
                      Rua e Referência Proxima <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="form-rua"
                        type="text"
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                        placeholder="Ex: Rua das Rosas, próximo ao número 120"
                        required
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <MapPin className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Anexo de Mídia */}
              <div className="pt-4 border-t border-neutral-900">
                <label className="text-sm font-extrabold text-neutral-200 block mb-2">
                  Registro Fotográfico (Evidência Opcional)
                </label>

                {!preview ? (
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={triggerFileInput}
                    className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-950/25'
                        : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-neutral-900 text-blue-500 border border-neutral-800 rounded-2xl">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-300">
                          Clique para navegar ou arraste a foto aqui
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Suporta JPEG, PNG de até 10 MB de resolução
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-neutral-900 rounded-xl border border-neutral-800 relative">
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-neutral-950 border border-neutral-800 hover:bg-red-950/20 hover:text-red-400 text-neutral-400 rounded-full transition-colors"
                      title="Deletar anexo"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-32 h-24 rounded-lg bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800 shadow-inner flex items-center justify-center">
                      <img src={preview} alt="Minhas evidências" className="w-full h-full object-cover" />
                    </div>

                    <div className="text-left py-1 overflow-hidden">
                      <p className="font-bold text-sm text-neutral-200 truncate">
                        {file?.name || 'evidencia_denuncia.jpg'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Tamanho do arquivo:{' '}
                        {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '1.40 MB'}
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-2.5 text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                        Pronto para carregar
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção 4: Identificação do Solicitante */}
              <div className="pt-4 border-t border-neutral-900">
                <h4 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Identificação de Segurança
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-nome" className="text-sm font-extrabold text-neutral-200">
                      Seu Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="form-nome"
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Carlos Augusto"
                        required
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <User className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Contato (Opcional) */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-contato" className="text-sm font-extrabold text-neutral-200">
                      Contato Seguro <span className="text-neutral-500">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="form-contato"
                        type="text"
                        value={contato}
                        onChange={(e) => setContato(e.target.value)}
                        placeholder="Email ou WhatsApp para retornos"
                        className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Phone className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Checkbox Anonimo */}
                <div className="mt-6 p-4 bg-neutral-900/40 rounded-xl border border-neutral-800/80 flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id="form-anonimo"
                      type="checkbox"
                      checked={anonimo}
                      onChange={(e) => setAnonimo(e.target.checked)}
                      className="w-5 h-5 bg-neutral-950 rounded border-neutral-800 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="text-left">
                    <label htmlFor="form-anonimo" className="text-sm font-bold text-white cursor-pointer select-none">
                      Quero que minha denúncia apareça de forma anônima para terceiros
                    </label>
                    <p className="text-neutral-500 text-xs mt-1">
                      Ao selecionar, seu nome e contatos ficarão totalmente inacessíveis para o mural público e buscas coletivas de transparência no site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerta de Conscientização sobre Denúncias Falsas */}
              <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-left">
                  <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    Aviso Importante: Denunciar Falsamente é Crime
                  </h5>
                  <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                    A comunicação de falsa denúncia ou de falsa ocorrência é crime previsto no <strong className="text-neutral-300">Art. 340 do Código Penal brasileiro</strong>. Toda queixa enviada de má-fé será devidamente registrada e encaminhada para as autoridades, sendo rigorosamente adotadas as medidas judiciais cabíveis. Use este espaço com responsabilidade em prol da nossa cidade!
                  </p>
                </div>
              </div>

              {/* Submit Wrapper */}
              <div className="pt-6 border-t border-neutral-900">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-neutral-300 border-t-white rounded-full animate-spin shrink-0" />
                      Registrando nos Sistemas Públicos...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 shrink-0" />
                      Protocolar Denúncia em Leme/SP
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
