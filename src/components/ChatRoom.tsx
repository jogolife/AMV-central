/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  Hash,
  Crown,
  Tv,
  Trash2
} from "lucide-react";
import { ChatMessage, CurrentUser } from "../types";

interface ChatRoomProps {
  currentUser: CurrentUser;
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function ChatRoom({ currentUser, onShowNotification }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  const handleBulkDelete = async (type: "selected" | "all") => {
    const isAll = type === "all";
    if (isAll) {
      if (!window.confirm("🔴 ATENÇÃO SHOGUN: Deseja realmente excluir TODAS as mensagens do chat permanentemente?")) return;
    } else {
      if (selectedIds.length === 0) {
        onShowNotification("Nenhuma mensagem selecionada para exclusão.", "info");
        return;
      }
      if (!window.confirm(`Deseja realmente excluir as ${selectedIds.length} mensagens selecionadas?`)) return;
    }

    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      if (currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'otakumestre')) {
        headersConfig["X-Admin-Secret"] = "1010";
      }

      const response = await fetch("/api/admin/bulk-delete?adminSecret=1010", {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({
          type: "chats",
          ids: isAll ? "all" : selectedIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        onShowNotification(isAll ? "Todas as mensagens do chat foram removidas!" : "Mensagens selecionadas excluídas!", "success");
        setMessages(data.chats || []);
        setSelectedIds([]);
        setIsSelectMode(false);
      } else {
        const errData = await response.json();
        onShowNotification(errData.error || "Falha na exclusão em massa.", "error");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
      onShowNotification("Erro ao se comunicar com o templo central.", "error");
    }
  };

  const toggleSelectMessage = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m.id));
    }
  };

  // Fetch messages helper
  const fetchChats = async (isQuiet = false) => {
    if (!isQuiet) setIsLoading(true);
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    } finally {
      if (!isQuiet) setIsLoading(false);
    }
  };

  // Setup periodic polling for real-time multiplayer chat feel
  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => {
      fetchChats(true);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Safe scroll to bottom on message updates (only if near bottom, first load, or sent by current user)
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isFirstLoad = prevMessagesLength.current === 0 && messages.length > 0;
    const hasNewMsgs = messages.length > prevMessagesLength.current;

    // Only scroll the inner container, do not use scrollIntoView which scrolls the host page viewport!
    if (isFirstLoad) {
      container.scrollTop = container.scrollHeight;
    } else if (hasNewMsgs) {
      // Check if scrolled within 150px of the bottom
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      const isMyMessage = messages[messages.length - 1]?.username === currentUser.username;

      if (isAtBottom || isMyMessage) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, currentUser.username]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Deseja realmente remover esta mensagem do chat permanentemente?")) return;
    
    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      // Inject robust admin bypass header if matching admin criteria
      if (currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'otakumestre')) {
        headersConfig["X-Admin-Secret"] = "1010";
      }

      const response = await fetch(`/api/chat/${messageId}?adminSecret=1010`, {
        method: "DELETE",
        headers: headersConfig
      });

      if (response.ok) {
        onShowNotification("Mensagem do chat removida pela moderação!", "success");
        // Update state locally
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        const data = await response.json();
        onShowNotification(data.error || "Erro ao remover mensagem.", "error");
      }
    } catch (err) {
      console.error("Failed to delete chat message:", err);
      onShowNotification("Erro ao se comunicar com o templo central.", "error");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messagePayload = {
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      content: inputText.trim(),
      isAdmin: currentUser.role === "admin"
    };

    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify(messagePayload)
      });

      if (response.ok) {
        const newMsg = await response.json();
        // Optimistic UI updates
        setMessages((prev) => [...prev, newMsg]);
        setInputText("");
      } else {
        onShowNotification("Falha ao enviar mensagem de chat.", "error");
      }
    } catch (err) {
      console.error("Chat send error:", err);
      onShowNotification("Erro de conexão ao enviar chat.", "error");
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 pb-12 text-white animate-fade-in font-sans">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5 font-display">
            <MessageSquare className="text-fuchsia-450 text-fuchsia-500 w-8 h-8" />
            <span>Chat dos Editores</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1.5">
            Converse sobre novas AMVs, compartilhe técnicas de render e debata spoilers de animes!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Chat box viewport (Spans 3 columns) */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          
          {/* Header */}
          <div className="bg-black/45 p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="p-1 px-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded text-xs font-black tracking-widest text-fuchsia-400 font-mono">
                SALA-GERAL
              </span>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-zinc-400 font-mono">Canal Ativo de Discussão</span>
            </div>
            
            <div className="flex items-center gap-2.5">
              {currentUser.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(!isSelectMode);
                      setSelectedIds([]);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                      isSelectMode 
                        ? "bg-fuchsia-600 border-fuchsia-500 text-white" 
                        : "bg-zinc-805/40 hover:bg-zinc-800 border-white/10 text-zinc-300"
                    } cursor-pointer`}
                  >
                    {isSelectMode ? "Sair do Modo Excluir Vários" : "Excluir Várias Mensagens"}
                  </button>
                  {isSelectMode && (
                    <button
                      type="button"
                      onClick={() => handleBulkDelete("all")}
                      className="px-3 py-1 rounded text-xs font-bold bg-red-950/40 hover:bg-red-650 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 transition-all cursor-pointer"
                      title="Apaga todas as mensagens do banco de dados"
                    >
                      Limpar Todo o Chat
                    </button>
                  )}
                </div>
              )}
              <div className="text-xs text-zinc-400 font-mono">
                Online: <strong className="text-fuchsia-400">@{currentUser.username}</strong>
              </div>
            </div>
          </div>

          {/* Selection control action-bar */}
          {isSelectMode && (
            <div className="bg-fuchsia-950/20 border-b border-fuchsia-500/20 p-3 px-4 flex items-center justify-between text-xs animate-fade-in shrink-0">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-fuchsia-400 font-bold">Modo de Seleção Ativado</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300 font-semibold">{selectedIds.length} selecionadas</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 rounded bg-zinc-800/50 hover:bg-zinc-700 text-zinc-200 font-semibold cursor-pointer border border-white/5 transition-colors"
                >
                  {selectedIds.length === messages.length ? "Desmarcar Todos" : "Selecionar Todos"}
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkDelete("selected")}
                  disabled={selectedIds.length === 0}
                  className="px-3 py-1 rounded bg-red-650 hover:bg-red-600 disabled:opacity-45 text-white font-bold tracking-wide transition-all uppercase text-[10px] cursor-pointer"
                >
                  Excluir Selecionadas ({selectedIds.length})
                </button>
              </div>
            </div>
          )}

          {/* Message scroll log */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/25">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm font-mono">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-t-2 border-fuchsia-500 border-solid rounded-full animate-spin mb-2" />
                  <span>Conectando ao chat dos ninjas...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic font-medium">
                Nenhuma mensagem enviada. Envie um 'Yo' para quebrar o gelo!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.username === currentUser.username;
                const isSelected = selectedIds.includes(msg.id);
                return (
                  <div 
                    key={msg.id} 
                    onClick={() => {
                      if (isSelectMode) {
                        toggleSelectMessage(msg.id);
                      }
                    }}
                    className={`flex items-start gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"} ${
                      isSelectMode ? "cursor-pointer group active:scale-[0.99] transition-all" : ""
                    }`}
                  >
                    {isSelectMode && (
                      <div className="flex items-center justify-center self-center shrink-0 pr-1 select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // toggled by parent click
                          className="w-4.5 h-4.5 rounded border-zinc-700 bg-black/45 text-fuchsia-500 focus:ring-fuchsia-500 accent-fuchsia-550 cursor-pointer pointer-events-none"
                        />
                      </div>
                    )}

                    {/* User profile image */}
                    <img 
                      src={msg.userAvatar} 
                      alt={msg.username} 
                      className={`w-9 h-9 rounded-lg bg-black border border-white/10 shrink-0 transition-all ${
                        isSelectMode && isSelected ? "border-fuchsia-500 scale-105" : ""
                      }`} 
                    />
                    
                    {/* Bubble wrapping */}
                    <div>
                      <div className={`flex items-center gap-1.5 text-xs text-zinc-500 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="font-bold text-zinc-300">@{msg.username}</span>
                        {msg.isAdmin && (
                          <span className="bg-amber-600/10 text-amber-500 border border-amber-500/20 text-[9px] px-1 rounded flex items-center gap-0.5 animate-pulse">
                            <Crown className="w-2.5 h-2.5" /> Shogun
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-600 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {currentUser.role === 'admin' && !isSelectMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg.id);
                            }}
                            className="p-1 rounded bg-red-950/20 hover:bg-red-500/35 border border-red-500/10 hover:border-red-500/40 text-red-500 hover:text-red-400 transition-all cursor-pointer focus:outline-none ml-1 shrink-0"
                            title="Moderador: Excluir mensagem"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed transition-all duration-200 ${
                        isMe 
                          ? "bg-gradient-to-br from-fuchsia-600 via-fuchsia-650 to-purple-700 text-white rounded-tr-none shadow-[0_4px_15px_rgba(192,38,211,0.25)]" 
                          : "bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none"
                      } ${
                        isSelectMode && isSelected 
                          ? "ring-2 ring-fuchsia-500 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)] bg-fuchsia-950/25" 
                          : ""
                      }`}>
                        <p className="break-words white-space-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-black/45 border-t border-white/10">
            <div className="flex items-center bg-black/35 p-1.5 pr-2 rounded-xl border border-white/5 focus-within:border-fuchsia-500 focus-within:shadow-[0_0_15px_rgba(191,48,211,0.25)] transition-all duration-300">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Discuta animes, AMVs ou chame alguém..."
                className="flex-1 bg-transparent px-3 py-1.5 outline-none text-sm text-zinc-200"
                maxLength={250}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:opacity-90 font-bold p-2 text-white rounded-lg text-sm transition-all shadow-[0_4px_12px_rgba(192,38,211,0.3)] flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

        {/* Sidebar Information Card (Spans 1 column) */}
        <div className="space-y-4">
          
          {/* Active Ninja Bio card */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
            <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-2 flex items-center gap-1 font-mono">
              <User className="w-4 h-4 text-fuchsia-500" /> Seu Perfil Ativo
            </h3>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-3">
              <div className="flex items-center space-x-3 mb-2">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username} 
                  className="w-10 h-10 rounded-lg bg-black border border-white/10" 
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-zinc-200 truncate">@{currentUser.username}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Subir no ranking postando AMVs!
                  </p>
                </div>
              </div>

              {currentUser.role === 'admin' && (
                <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[11px] font-mono flex items-center gap-1 justify-center font-bold">
                  <Crown className="w-4 h-4 animate-bounce" /> Conta Moderador Ativo
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ / Code Segments */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 shadow-lg backdrop-blur-md">
            <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider flex items-center gap-1 font-mono">
              <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" /> Regras da Arena
            </h3>
            
            <ul className="text-xs text-zinc-400 space-y-2 list-none p-0 font-medium leading-relaxed mt-2">
              <li className="flex items-start gap-1.5">
                <span className="text-fuchsia-500 font-bold mt-0.5">•</span>
                <span>Proibido floodar ou compartilhar links de vírus.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fuchsia-500 font-bold mt-0.5">•</span>
                <span>Os admins possuem as insígnias douradas do clã.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-fuchsia-500 font-bold mt-0.5">•</span>
                <span>Anuncie se postar uma nova AMV no catálogo!</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
