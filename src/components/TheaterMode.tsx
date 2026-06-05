/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Tv, 
  Music, 
  ChevronLeft, 
  Send, 
  Clock, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  Trash2, 
  CornerDownRight, 
  Disc,
  Smartphone
} from "lucide-react";
import { AMV, Comment, CurrentUser } from "../types";
import GoogleAdSenseAd from "./GoogleAdSenseAd";

interface TheaterModeProps {
  amv: AMV;
  onBack: () => void;
  currentUser: CurrentUser;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  isAdmin: boolean;
  onDeleteRequest: (id: string) => void;
  onDeleteComment?: (amvId: string, commentId: string) => void;
  onBulkDeleteComments?: (amvId: string, type: "selected" | "all", commentIds?: string[]) => void;
}

export default function TheaterMode({
  amv,
  onBack,
  currentUser,
  onLike,
  onDislike,
  onAddComment,
  isAdmin,
  onDeleteRequest,
  onDeleteComment,
  onBulkDeleteComments
}: TheaterModeProps) {
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [isCommentSelectMode, setIsCommentSelectMode] = useState<boolean>(false);

  // Parse YouTube video code
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(amv.videoUrl);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(amv.id, commentText.trim());
    setCommentText("");
  };

  // Triggers localized feedback animation on click
  const triggerLike = () => {
    setIsLiking(true);
    onLike(amv.id);
    setTimeout(() => setIsLiking(false), 500);
  };

  const triggerDislike = () => {
    setIsDisliking(true);
    onDislike(amv.id);
    setTimeout(() => setIsDisliking(false), 500);
  };

  // Render dummy video player if not youtube
  const renderMockPlayer = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0c0512] via-[#050505] to-[#120516] flex flex-col items-center justify-center text-center p-6 border border-white/10">
      <div className="relative mb-6">
        <Disc className="w-20 h-20 text-fuchsia-500/80 animate-spin" style={{ animationDuration: '6s' }} />
        <PlayVideoSimulationBars />
      </div>
      <h3 className="text-lg font-extrabold text-zinc-105 text-zinc-100 tracking-wide font-sans">{amv.title}</h3>
      <p className="text-zinc-400 text-xs mt-2 max-w-md font-mono">
        Tocando link direto: <code className="text-fuchsia-400 break-all">{amv.videoUrl}</code>
      </p>
      <div className="mt-6 flex items-center space-x-2 bg-fuchsia-600/10 border border-fuchsia-500/20 px-4 py-2 rounded-xl text-xs text-fuchsia-400 font-bold">
        <span>Simulando Stream de Vídeo Ativo</span>
      </div>
    </div>
  );

  return (
    <div className="text-white space-y-6 max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 pb-12 animate-fade-in">
      
      {/* Return button row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 px-4 rounded-xl border border-white/5 hover:border-white/10 transition-all text-sm font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar ao Portal</span>
        </button>

        {isAdmin && (
          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 p-1.5 px-3 rounded-xl text-amber-500 text-xs font-mono font-bold">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>Painel do Shogun Ativo</span>
          </div>
        )}
      </div>

      {/* Hero layout grid: Player left, meta detail right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Playback compartment (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {youtubeId ? (
              <iframe
                id="yt-video-player"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                title={amv.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              renderMockPlayer()
            )}
          </div>

          {/* Player stats bar */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-zinc-100 tracking-tight leading-tight font-display">
                  {amv.title}
                </h1>
                
                {/* Views & stats */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-455 text-zinc-400 mt-2 font-mono">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-300 font-bold">{amv.quality}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{amv.views.toLocaleString()} visualizações</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Postado em {new Date(amv.createdAt).toLocaleDateString("pt-BR")}</span>
                  </span>
                </div>
              </div>

              {/* Engagement triggers */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={triggerLike}
                  className={`flex items-center space-x-1.5 p-2 px-4 rounded-xl border transition duration-300 font-mono text-sm ${
                    isLiking 
                      ? "bg-fuchsia-600 border-fuchsia-500 text-white scale-105" 
                      : "bg-black/40 hover:bg-white/5 border-white/10 text-zinc-300"
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiking ? "animate-bounce" : "text-fuchsia-450 text-fuchsia-500 fill-fuchsia-500/20"}`} />
                  <span className="font-bold">{amv.likes}</span>
                </button>

                <button
                  onClick={triggerDislike}
                  className={`flex items-center space-x-1.5 p-2 px-4 rounded-xl border transition duration-300 font-mono text-sm ${
                    isDisliking 
                      ? "bg-zinc-700 border-zinc-650 text-white scale-105" 
                      : "bg-black/40 hover:bg-white/5 border-white/10 text-zinc-400"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 text-zinc-500" />
                  <span className="font-bold">{amv.dislikes}</span>
                </button>
              </div>
            </div>

            {/* Neon Anime List */}
            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
              <span className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-fuchsia-450 text-fuchsia-500" /> Anime(s) em cena:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {amv.animes.map((anime, index) => (
                  <span
                    key={index}
                    className="bg-fuchsia-500/5 hover:bg-fuchsia-500/10 border border-fuchsia-500/20 hover:border-fuchsia-500/30 text-fuchsia-400 font-extrabold text-xs px-3 py-1 rounded-lg transition-all"
                  >
                    {anime}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Google AdSense Horizontal Slot - Related to site */}
          <GoogleAdSenseAd 
            slot="1234567890" 
            variant="horizontal" 
            className="my-3"
          />

          {/* Interactive Comments Drawer */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3.5 gap-2">
              <h3 className="text-lg font-bold flex items-center space-x-2 text-zinc-100 font-display">
                <MessageSquare className="text-fuchsia-500 w-5 h-5" />
                <span>Diálogo de Editores ({amv.comments.length})</span>
              </h3>
              {isAdmin && onBulkDeleteComments && (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCommentSelectMode(!isCommentSelectMode);
                      setSelectedCommentIds([]);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                      isCommentSelectMode 
                        ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-md" 
                        : "bg-zinc-805/40 hover:bg-zinc-800 border-white/10 text-zinc-300"
                    } cursor-pointer`}
                  >
                    {isCommentSelectMode ? "Sair da Seleção" : "Excluir Vários Comentários"}
                  </button>
                  {isCommentSelectMode && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onBulkDeleteComments) {
                          onBulkDeleteComments(amv.id, "all");
                          setSelectedCommentIds([]);
                          setIsCommentSelectMode(false);
                        }
                      }}
                      className="px-2 py-1 rounded text-[11px] font-bold bg-red-950/45 border border-red-500/20 hover:bg-red-650 text-red-400 hover:text-white transition-all cursor-pointer"
                    >
                      Excluir Todos
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Selection Status action-bar */}
            {isCommentSelectMode && (
              <div className="bg-fuchsia-950/15 border border-fuchsia-500/20 p-2.5 px-3 rounded-xl flex items-center justify-between text-[11px] animate-fade-in shrink-0">
                <span className="text-zinc-300 font-medium">Marcados: <b className="text-fuchsia-400 font-bold">{selectedCommentIds.length}</b> comentários</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCommentIds.length === amv.comments.length) {
                        setSelectedCommentIds([]);
                      } else {
                        setSelectedCommentIds(amv.comments.map(c => c.id));
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-250 font-semibold"
                  >
                    {selectedCommentIds.length === amv.comments.length ? "Desmarcar Todos" : "Marcar Todos"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBulkDeleteComments && selectedCommentIds.length > 0) {
                        onBulkDeleteComments(amv.id, "selected", selectedCommentIds);
                        setSelectedCommentIds([]);
                        setIsCommentSelectMode(false);
                      }
                    }}
                    disabled={selectedCommentIds.length === 0}
                    className="px-2.5 py-0.5 rounded bg-red-650 disabled:opacity-45 hover:bg-red-600 font-bold text-white uppercase text-[9px] tracking-wide"
                  >
                    Excluir ({selectedCommentIds.length})
                  </button>
                </div>
              </div>
            )}

            {/* Post box */}
            <form onSubmit={handlePostComment} className="flex gap-2.5 items-start mt-2">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.username} 
                className="w-9 h-9 rounded-lg border border-white/10 bg-black" 
              />
              <div className="flex-1 min-w-0 bg-black/40 rounded-xl border border-white/10 p-2 focus-within:border-fuchsia-500 transition-all duration-300">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva sua opinião, critique a edição, comente a música..."
                  className="w-full bg-transparent text-sm text-zinc-200 outline-none resize-none border-0 p-1 focus:ring-0"
                />
                <div className="flex justify-between items-center border-t border-white/5 pt-2 px-1">
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Postando como <strong className="text-zinc-400">@{currentUser.username}</strong>
                  </div>
                  <button
                    type="submit"
                    className="p-1 px-3 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-650 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-md"
                  >
                    <span>Enviar</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3 mt-4 max-h-[350px] overflow-y-auto pr-1">
              {amv.comments.length === 0 ? (
                <div className="text-zinc-500 text-center py-6 text-sm">
                  Nenhum comentário ainda. Seja o primeiro a selar sua opinião!
                </div>
              ) : (
                [...amv.comments].reverse().map((c) => {
                  const isSelected = selectedCommentIds.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => {
                        if (isCommentSelectMode) {
                          setSelectedCommentIds(prev => 
                            prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                          );
                        }
                      }}
                      className={`flex space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                        isCommentSelectMode 
                          ? "cursor-pointer active:scale-[0.99] select-none" 
                          : ""
                      } ${
                        isCommentSelectMode && isSelected
                          ? "ring-2 ring-fuchsia-500 border-fuchsia-500 bg-fuchsia-950/20 shadow-[0_0_12px_rgba(192,38,211,0.25)]"
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {isCommentSelectMode && (
                        <div className="flex items-center justify-center shrink-0 pr-1 select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // toggled by parent click
                            className="w-4 h-4 rounded border-zinc-700 bg-black/45 text-fuchsia-500 focus:ring-fuchsia-500 accent-fuchsia-550 cursor-pointer pointer-events-none"
                          />
                        </div>
                      )}
                      
                      <img 
                        src={c.userAvatar} 
                        alt={c.username} 
                        className={`w-8 h-8 rounded-md bg-black border shrink-0 transition-all ${
                          isCommentSelectMode && isSelected ? "border-fuchsia-500 scale-105" : "border-white/10"
                        }`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-300">@{c.username}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isAdmin && onDeleteComment && !isCommentSelectMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Deseja realmente remover este comentário permanentemente?")) {
                                    onDeleteComment(amv.id, c.id);
                                  }
                                }}
                                className="p-1 rounded bg-red-950/25 hover:bg-red-950/65 border border-red-500/10 hover:border-red-500/35 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remover comentário"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed break-words">{c.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Info panel & Sidebar (Spans 1 column) */}
        <div className="space-y-4 relative z-10">
          
          {/* Creator Profile Specs */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider mb-3 font-mono">Informações do Autor</h3>
            <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-white/5">
              <img 
                src={amv.creatorAvatar} 
                alt={amv.creator} 
                className="w-12 h-12 rounded-lg bg-black border border-white/10" 
              />
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm text-zinc-200 truncate">@{amv.creator}</p>
                <span className="inline-block bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded mt-1 uppercase tracking-wide">
                  Ninja Curador
                </span>
              </div>
            </div>
          </div>

          {/* Soundtrack Meta Box */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-xs uppercase font-extrabold text-zinc-500 tracking-wider mb-2 font-mono">🎵 Trilha Sonora</h3>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white/5 p-2 rounded-lg text-fuchsia-450 text-fuchsia-400 border border-white/10">
                  <Music className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-100 text-sm truncate">{amv.musicTitle}</p>
                  <p className="text-zinc-500 font-mono text-xs truncate">por {amv.musicArtist || "Artista Desconhecido"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights & Matches box */}
          <div className="relative overflow-hidden bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-600/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center space-x-1.5 text-zinc-100 font-bold text-sm font-display">
              <Sparkles className="w-4 h-4 text-fuchsia-500 fill-fuchsia-500/10 animate-pulse" />
              <span>Inteligência do Hubushido</span>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Classificação Estilística AI</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-black text-xs text-fuchsia-400 bg-fuchsia-950/20 border border-fuchsia-500/20 px-2.5 py-1 rounded-md">
                  {amv.style}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium font-sans">Aparência de vídeo</span>
              </div>

              <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold mt-3">Tags Inteligentes</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {amv.tags.map((tag, idx) => (
                  <span key={idx} className="bg-white/5 text-zinc-400 text-[10px] px-2 py-0.5 rounded font-mono border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Unique explanation line */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-xs text-zinc-400 italic leading-normal font-sans">
                  "O clima <strong className="text-zinc-300">{amv.style}</strong> desta edição sincroniza com a densidade da melodia no timbre de <strong className="text-zinc-300">{amv.musicArtist || 'Vários artistas'}</strong>, evocando arrepios correspondentes aos arcos fundamentais de {amv.animes.join(', ')}."
                </p>
                <div className="text-[9px] text-zinc-600 font-mono mt-2 text-right">Sugestão Gemini-3.5-Flash Ativa</div>
              </div>
            </div>
          </div>

          {/* Admin moderator emergency eject panel */}
          {isAdmin && (
            <div className="bg-red-950/20 border-red-500/20 border p-5 rounded-2xl text-center space-y-3 shadow-md">
              <div className="text-red-400 font-extrabold text-sm flex items-center justify-center space-x-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Moderação do Shogun</span>
              </div>
              <p className="text-[11px] text-red-300/80 leading-relaxed">
                Você possui permissões de Administrador do sistema. Você pode retirar esta AMV do catálogo globalpermanentemente.
              </p>
              <button
                id="theater-mod-delete"
                onClick={() => onDeleteRequest(amv.id)}
                className="w-full bg-red-600 hover:bg-red-500 text-white rounded-xl py-2 text-xs font-black transition flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>EXCLUIR AMV DO HUB</span>
              </button>
            </div>
          )}

          {/* Google AdSense Sidebar block */}
          <GoogleAdSenseAd 
            slot="5678901234" 
            variant="square" 
            className="bg-white/5 border border-white/10 mt-4"
          />

        </div>

      </div>
    </div>
  );
}

// Internal little cosmetic helper for simulating music frequencies when playing direct links
function PlayVideoSimulationBars() {
  return (
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end space-x-1 h-6">
      <div className="w-1.5 bg-fuchsia-500 animate-pulse h-3" style={{ animationDuration: '0.6s' }} />
      <div className="w-1.5 bg-fuchsia-500 animate-pulse h-5" style={{ animationDuration: '0.4s' }} />
      <div className="w-1.5 bg-fuchsia-500 animate-pulse h-2" style={{ animationDuration: '0.8s' }} />
      <div className="w-1.5 bg-fuchsia-500 animate-pulse h-6" style={{ animationDuration: '0.5s' }} />
      <div className="w-1.5 bg-fuchsia-500 animate-pulse h-4" style={{ animationDuration: '0.7s' }} />
    </div>
  );
}
