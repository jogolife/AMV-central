/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UploadCloud, 
  Sparkles, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Flame, 
  Disc,
  Play,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { CurrentUser } from "../types";

interface UploadFormProps {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  setShowAuthModal: (val: boolean) => void;
  onUploadSuccess: () => void;
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const COMMON_ANIMES = [
  "Naruto Shippuden",
  "One Piece",
  "Demon Slayer",
  "Attack on Titan",
  "Jujutsu Kaisen",
  "Chainsaw Man",
  "My Hero Academia",
  "Your Name",
  "Bleach",
  "Neon Genesis Evangelion",
  "Hunter x Hunter",
  "Solo Leveling"
];

export default function UploadForm({ 
  currentUser, 
  isAuthenticated,
  setShowAuthModal,
  onUploadSuccess, 
  onShowNotification 
}: UploadFormProps) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  
  // Anime and tag states
  const [selectedAnimes, setSelectedAnimes] = useState<string[]>([]);
  const [customAnime, setCustomAnime] = useState("");
  const [tags, setTags] = useState<string[]>(["edit"]);
  const [newTagInput, setNewTagInput] = useState("");

  const [styleValue, setStyleValue] = useState<'Sad' | 'Action' | 'Epic' | 'Romance' | 'Other'>("Epic");
  const [qualityValue, setQualityValue] = useState<'720p' | '1080p' | '4K'>("1080p");
  const [durationValue, setDurationValue] = useState("3:20");

  // AI loading and suggestion status
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const handleToggleAnime = (anime: string) => {
    if (selectedAnimes.includes(anime)) {
      setSelectedAnimes(prev => prev.filter(a => a !== anime));
    } else {
      setSelectedAnimes(prev => [...prev, anime]);
    }
  };

  const handleAddCustomAnime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnime.trim()) return;
    const trimmed = customAnime.trim();
    if (!selectedAnimes.includes(trimmed)) {
      setSelectedAnimes(prev => [...prev, trimmed]);
    }
    setCustomAnime("");
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = newTagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  // The stellar server-side Gemini suggestion trigger!
  const handleAiLookup = async () => {
    if (!title.trim()) {
      onShowNotification("Digite ao menos o título do AMV para consultar a IA Hubushido!", "error");
      return;
    }

    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);
    onShowNotification("Consultando IA Hubushido baseada em Gemini-3.5-Flash...", "info");

    try {
      const response = await fetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          musicTitle: musicTitle.trim() || undefined,
          description: `Qualidade: ${qualityValue}, Tempo: ${durationValue}. Tags atuais: ${tags.join(', ')}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysisResult(data);

        // Autofill form inputs elegantly!
        if (data.animes && data.animes.length > 0) {
          // Merge unique suggested animes
          setSelectedAnimes(prev => {
            const merged = [...prev];
            data.animes.forEach((a: string) => {
              if (!merged.includes(a)) merged.push(a);
            });
            return merged;
          });
        }
        
        if (data.style) {
          setStyleValue(data.style);
        }

        if (data.tags && data.tags.length > 0) {
          setTags(prev => {
            const merged = [...prev];
            data.tags.forEach((t: string) => {
              const lower = t.toLowerCase();
              if (!merged.includes(lower)) merged.push(lower);
            });
            return merged;
          });
        }

        if (data.musicArtist && !musicArtist) {
          setMusicArtist(data.musicArtist);
        }

        onShowNotification("🤖 IA Hubushido: Sugestões aplicadas com sucesso!", "success");
      } else {
        onShowNotification("Houve um problema com a sugestão automática offline.", "error");
      }
    } catch (err) {
      console.error("AI lookup error:", err);
      onShowNotification("Erro ao falar com o oráculo de IA do Hubushido.", "error");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Submit trigger
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !videoUrl.trim() || !musicTitle.trim()) {
      onShowNotification("Campos obrigatórios: Nome da AMV, Link do Vídeo e Nome da Música.", "error");
      return;
    }

    const payload = {
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      musicTitle: musicTitle.trim(),
      musicArtist: musicArtist.trim() || "Various Artists",
      animes: selectedAnimes.length > 0 ? selectedAnimes : ["Anime Mix"],
      tags: tags.length > 0 ? tags : ["edit"],
      style: styleValue,
      quality: qualityValue,
      duration: durationValue,
      creator: currentUser.username,
    };

    onShowNotification("Publicando sua obra na arena...", "info");

    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/amvs", {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onShowNotification("AMV Publicada no Portal!", "success");
        onUploadSuccess();
      } else {
        const errorData = await response.json();
        onShowNotification(errorData.error || "Erro ao publicar AMV.", "error");
      }
    } catch (err) {
      console.error("Submit AMV error:", err);
      onShowNotification("Erro de conexão ao salvar AMV.", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-white animate-fade-in font-display">
        <div className="bg-zinc-950/80 border border-red-500/30 rounded-2xl p-8 sm:p-12 shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-md space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <UploadCloud className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Acesso Restrito: Portão do Templo
          </h1>
          
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto font-sans font-medium">
            Para publicar suas AMVs na arena global, receber feedback e competir no prestigiado Leaderboard semanal, você precisa ingressar como guerreiro oficial do Clã.
          </p>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-red-650 to-red-750 hover:from-red-600 hover:to-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition duration-300 shadow-[0_5px_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] transform cursor-pointer"
            >
              Prestar Juramento (Entrar / Cadastrar-se)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-4 pb-12 text-white animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-white/10 pb-4 mb-3 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2 font-display">
          <UploadCloud className="text-fuchsia-450 text-fuchsia-500 w-8 h-8 animate-bounce-slow" />
          <span>Postar Nova AMV</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1 max-w-lg mx-auto">
          Publique suas criações do YouTube ou links MP4 para competir nas classificações semanais com outros ninjas!
        </p>
      </div>

      {/* Main Grid: Upload Fields Info left, AI Sidekick info right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6">
        
        {/* Upload form container space (Spans 2 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white/5 border border-white/10 p-5 sm:p-7 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-5 backdrop-blur-md">
          
          <h2 className="text-lg font-bold border-b border-white/5 pb-2 flex items-center gap-2 font-display">
            <Plus className="text-fuchsia-500 w-5 h-5" />
            <span>Dados de Publicação</span>
          </h2>

          <div className="space-y-4">
            
            {/* AMV title and AI help banner */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                  Nome do AMV <span className="text-fuchsia-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAiLookup}
                  disabled={isAiAnalyzing || !title.trim()}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition flex items-center gap-1 border font-mono ${
                    !title.trim()
                      ? "bg-white/5 text-zinc-650 border-white/5 cursor-not-allowed"
                      : "bg-fuchsia-600/90 text-white border-fuchsia-500/20 hover:bg-fuchsia-650 shadow-[0_4px_12px_rgba(192,38,211,0.2)] scroll-smooth cursor-pointer"
                  }`}
                  title="A IA preencherá automaticamente animes, tags, music e clima do título!"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Consultar IA</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Naruto vs Sasuke AMV - In The End"
                className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all duration-300"
                required
              />
            </div>

            {/* Video url */}
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                Link do Vídeo (YouTube / MP4) <span className="text-fuchsia-500">*</span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=y8pT4-vjY0A"
                className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all duration-300"
                required
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                YouTube Embed é integrado de forma nativa e pode ser assistido no portal!
              </p>
            </div>

            {/* Soundtrack info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                  Nome da Música <span className="text-fuchsia-500">*</span>
                </label>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="Ex: In The End"
                  className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                  Artista / Banda
                </label>
                <input
                  type="text"
                  value={musicArtist}
                  onChange={(e) => setMusicArtist(e.target.value)}
                  placeholder="Ex: Linkin Park"
                  className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all duration-300"
                />
              </div>
            </div>

            {/* Quality style duration widgets */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                  Corte (Clima)
                </label>
                <select
                  value={styleValue}
                  onChange={(e) => setStyleValue(e.target.value as any)}
                  className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-xs focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all cursor-pointer font-semibold text-zinc-100"
                >
                  <option value="Epic" className="bg-[#050505]">Epic (Hype/Glory)</option>
                  <option value="Sad" className="bg-[#050505]">Sad (Emotion/Chills)</option>
                  <option value="Action" className="bg-[#050505]">Action (Fights/Haste)</option>
                  <option value="Romance" className="bg-[#050505]">Romance (Love/Vibe)</option>
                  <option value="Other" className="bg-[#050505]">Other (Edit Special)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                  Qualidade
                </label>
                <select
                  value={qualityValue}
                  onChange={(e) => setQualityValue(e.target.value as any)}
                  className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-xs focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all cursor-pointer font-bold text-zinc-100"
                >
                  <option value="720p" className="bg-[#050505]">720p HD</option>
                  <option value="1080p" className="bg-[#050505]">1080p FH</option>
                  <option value="4K" className="bg-[#050505]">4K Ultra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                  Duração
                </label>
                <input
                  type="text"
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="Ex: 3:15"
                  className="w-full bg-black/45 border border-white/10 p-2.5 rounded-xl text-xs focus:outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all font-mono text-center text-zinc-100"
                />
              </div>
            </div>

            {/* Anime Multi Selection */}
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-2">
                Animes Presentes (Selecione um ou mais)
              </label>
              
              {/* Common anime list chip grid */}
              <div className="flex flex-wrap gap-1.5 p-3 bg-black/40 rounded-xl border border-white/10 max-h-[140px] overflow-y-auto">
                {COMMON_ANIMES.map((anime) => {
                  const isSelected = selectedAnimes.includes(anime);
                  return (
                    <button
                      key={anime}
                      type="button"
                      onClick={() => handleToggleAnime(anime)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                        isSelected 
                          ? "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-400" 
                          : "bg-white/5 border-white/5 hover:border-white/20 text-zinc-400"
                      }`}
                    >
                      {anime}
                    </button>
                  );
                })}
              </div>

              {/* Custom manual anime input */}
              <div className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={customAnime}
                  onChange={(e) => setCustomAnime(e.target.value)}
                  placeholder="Se o anime não está acima, digite aqui..."
                  className="flex-1 bg-black/45 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all font-bold text-zinc-100"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAnime}
                  className="bg-white/10 hover:bg-white/15 p-2 px-3.5 rounded-lg text-xs font-black text-zinc-200 transition-all cursor-pointer"
                >
                  Adicionar
                </button>
              </div>

              {selectedAnimes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono mr-1">Selecionados:</span>
                  {selectedAnimes.map(a => (
                    <span key={a} className="bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span>{a}</span>
                      <button 
                        type="button" 
                        onClick={() => handleToggleAnime(a)}
                        className="hover:text-fuchsia-300 font-bold text-[8px] pl-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive tag manager */}
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1">
                Anotações (Tags do Vídeo)
              </label>
              <div className="bg-black/45 p-2.5 rounded-xl border border-white/10 flex flex-wrap gap-1.5 items-center focus-within:border-fuchsia-500 focus-within:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all duration-300">
                {tags.map((tg) => (
                  <span key={tg} className="bg-white/5 border border-white/5 text-zinc-300 text-[10px] uppercase font-mono px-2 py-0.5 rounded flex items-center space-x-1">
                    <span>#{tg}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tg)} 
                      className="text-zinc-500 hover:text-white pl-1 font-bold text-[8px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Escreva e aperte Enter..."
                  className="bg-transparent text-xs outline-none text-zinc-300 font-mono min-w-[120px] p-0.5"
                />
              </div>
              <p className="text-[10px] text-[#8c8c93] mt-1.5 font-mono">
                Aperte <kbd className="text-zinc-400 font-semibold bg-white/5 px-1 py-0.5 rounded">Enter</kbd> ou coloque uma vírgula para adicionar cada tag.
              </p>
            </div>

          </div>

          {/* Submit action panel */}
          <div className="pt-4 border-t border-white/5 flex justify-end space-x-3">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-650 text-white rounded-xl text-sm font-black transition-all flex items-center shadow-[0_4px_15px_rgba(192,38,211,0.2)] hover:shadow-[0_4px_25px_rgba(192,38,211,0.4)] gap-1.5 cursor-pointer uppercase tracking-wider text-xs font-display"
            >
              <UploadCloud className="w-5 h-5 animate-pulse" />
              <span>Publicar AMV na Arena</span>
            </button>
          </div>

        </form>

        {/* AI Copilot Suggestion Helper Panel (Spans 1 column) */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4 shadow-2xl relative backdrop-blur-md">
          <div className="absolute top-0 right-0 w-20 h-20 bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center space-x-1.5 font-display">
            <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse fill-fuchsia-400/15" />
            <span className="font-extrabold text-sm tracking-wide text-zinc-100">Co-Piloto AI Hubushido</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Com nosso clã de IA, você não precisa categorizar tudo sozinho! Digite o nome da AMV e clique no botão <span className="text-fuchsia-400 font-bold">Consultar IA</span> acima. 
          </p>

          <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-3 relative min-h-[220px] flex flex-col justify-center">
            {isAiAnalyzing ? (
              <div className="text-center font-mono space-y-3">
                <Disc className="w-10 h-10 text-fuchsia-450 text-fuchsia-500 mx-auto animate-spin" />
                <p className="text-[10px] text-fuchsia-400">Gemini-3.5-Flash está desdobrando o espectro e identificando animes...</p>
              </div>
            ) : aiAnalysisResult ? (
              <div className="space-y-3 animate-fade-in text-xs font-semibold text-zinc-300">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 uppercase font-mono border-b border-white/5 pb-1.5">
                  <CheckCircle className="text-fuchsia-500 w-3.5 h-3.5" />
                  <span>Análise de IA Concluída</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">Animes Detectados:</span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysisResult.animes?.map((a: string) => (
                      <span key={a} className="bg-black/50 text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px] border border-white/5">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono block">Estilo Recomendado:</span>
                  <span className="bg-fuchsia-955/20 text-fuchsia-400 border border-fuchsia-500/20 px-2.5 py-0.5 rounded-md font-mono text-[10px] inline-block font-black uppercase">
                    {aiAnalysisResult.style}
                  </span>
                </div>

                {aiAnalysisResult.musicArtist && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono block">Artista Encontrado:</span>
                    <strong className="text-zinc-100 font-mono text-[11px]">{aiAnalysisResult.musicArtist}</strong>
                  </div>
                )}

                {aiAnalysisResult.briefMatchExplanation && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono block mb-1">Inspeção Estética:</span>
                    <p className="text-[11px] text-zinc-400 italic font-sans leading-relaxed">
                      "{aiAnalysisResult.briefMatchExplanation}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center font-mono space-y-2">
                <AlertTriangle className="w-8 h-8 text-zinc-650 mx-auto" />
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Aguardando consulta.<br />Escreva o título, opcionalmente a música no form principal e clique em "Consultar IA" para testar o poder de identificação baseado no modelo Gemini!
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-black/45 rounded-xl border border-white/5 shadow-inner">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-405 text-fuchsia-400 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500" /> Dica de Ninja
            </h4>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Utilize títulos de AMVs claros que já contenham o nome dos animes envolvidos e o nome da música para que o sensor cognitivo de inteligência proporcione resultados ainda mais refinados!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
