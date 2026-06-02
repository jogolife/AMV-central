/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Compass, 
  Plus, 
  Search, 
  Award, 
  TrendingUp, 
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Key,
  Trash2
} from "lucide-react";

import { AMV, CurrentUser } from "./types";
import Navigation from "./components/Navigation";
import AMVCard from "./components/AMVCard";
import TheaterMode from "./components/TheaterMode";
import ChatRoom from "./components/ChatRoom";
import StatsDashboard from "./components/StatsDashboard";
import UploadForm from "./components/UploadForm";
import AdminLoginModal from "./components/AdminLoginModal";

// Helper for loading user session or preparing offline identities
const DEFAULT_USER_NAME = `Ronin_${Math.floor(Math.random() * 900) + 100}`;
const DEFAULT_AVATAR = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${DEFAULT_USER_NAME}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [amvList, setAmvList] = useState<AMV[]>([]);
  const [selectedAMV, setSelectedAMV] = useState<AMV | null>(null);
  const [selectedAmvIds, setSelectedAmvIds] = useState<string[]>([]);
  const [isAmvSelectMode, setIsAmvSelectMode] = useState<boolean>(false);

  // Active user session
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem("hubushido_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      username: DEFAULT_USER_NAME,
      avatar: DEFAULT_AVATAR,
      role: "user"
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState<string>("All");
  const [filterQuality, setFilterQuality] = useState<string>("All");
  const [filterAnime, setFilterAnime] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest"); // 'newest' | 'views' | 'likes'

  // Notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
    show: boolean;
  }>({ message: "", type: "info", show: false });

  // Discreet Admin Modal login toggle
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Save profile update
  useEffect(() => {
    localStorage.setItem("hubushido_profile", JSON.stringify(currentUser));
  }, [currentUser]);

  // Authenticate user against database on app mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("hubushido_token");
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid/expired
          localStorage.removeItem("hubushido_token");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auto authentication failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Load AMVs from system database
  const loadAMVs = async () => {
    try {
      const response = await fetch("/api/amvs");
      if (response.ok) {
        const data = await response.json();
        setAmvList(data);
      }
    } catch (err) {
      console.error("Error fetching AMVs:", err);
      showNotification("Erro ao conectar com o catálogo de AMVs.", "error");
    }
  };

  useEffect(() => {
    loadAMVs();
  }, []);

  // Show customized toasts
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = "info") => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Watch video trigger: raises views count in backend
  const handleWatchAMV = async (amv: AMV) => {
    setSelectedAMV(amv);
    // Fetch views increment quiet in bg
    try {
      const response = await fetch(`/api/amvs/${amv.id}/view`, { method: "POST" });
      if (response.ok) {
        const viewData = await response.json();
        // Update local status with updated views count
        setAmvList(prev => prev.map(a => a.id === amv.id ? { ...a, views: viewData.views } : a));
        setSelectedAMV(prev => prev && prev.id === amv.id ? { ...prev, views: viewData.views } : prev);
      }
    } catch (err) {
      console.error("View count increment failed:", err);
    }
  };

  // Upvote/Like trigger
  const handleLikeAMV = async (id: string) => {
    try {
      const response = await fetch(`/api/amvs/${id}/like`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setAmvList(prev => prev.map(a => a.id === id ? { ...a, likes: data.likes } : a));
        setSelectedAMV(prev => prev && prev.id === id ? { ...prev, likes: data.likes } : prev);
        showNotification("Vídeo curtido! +1 Ponto de Hype na classificação.", "success");
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // Downvote/Dislike trigger
  const handleDislikeAMV = async (id: string) => {
    try {
      const response = await fetch(`/api/amvs/${id}/dislike`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setAmvList(prev => prev.map(a => a.id === id ? { ...a, dislikes: data.dislikes } : a));
        setSelectedAMV(prev => prev && prev.id === id ? { ...prev, dislikes: data.dislikes } : prev);
      }
    } catch (err) {
      console.error("Dislike failed:", err);
    }
  };

  // Comment submission callback
  const handleAddComment = async (id: string, text: string) => {
    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`/api/amvs/${id}/comment`, {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({
          username: currentUser.username,
          text,
          userAvatar: currentUser.avatar
        })
      });

      if (response.ok) {
        const newComment = await response.json();
        // Append comment dynamically
        setAmvList(prev => prev.map(a => {
          if (a.id === id) {
            return { ...a, comments: [...a.comments, newComment] };
          }
          return a;
        }));

        setSelectedAMV(prev => {
          if (prev && prev.id === id) {
            return { ...prev, comments: [...prev.comments, newComment] };
          }
          return prev;
        });

        showNotification("Comentário publicado com sucesso!", "success");
      }
    } catch (err) {
      console.error("Comment post failure:", err);
      showNotification("Erro ao postar seu comentário.", "error");
    }
  };

  // Moderator Delete trigger. Note: admin secret is sent to authenticate deletion
  const handleDeleteAMV = async (id: string) => {
    const doubleConfirm = window.confirm("Deseja realmente deletar esta AMV permanentemente do clã global?");
    if (!doubleConfirm) return;

    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;
      
      // Inject double-failsafe admin secret header if the user is mestre or admin role
      if (currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'otakumestre')) {
        headersConfig["X-Admin-Secret"] = "1010";
      }

      // Add query param bypass
      const url = `/api/amvs/${id}?adminSecret=1010`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: headersConfig
      });

      if (response.ok) {
        setAmvList(prev => prev.filter(a => a.id !== id));
        if (selectedAMV?.id === id) {
          setSelectedAMV(null);
        }
        showNotification("AMV Excluída da Arena por Poder Shogun!", "success");
        loadAMVs(); // Reload list
      } else {
        const errData = await response.json();
        showNotification(errData.error || "Acesso de exclusão recusado.", "error");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      showNotification("Erro de conexão ao remover item.", "error");
    }
  };

  // Admin Comment deletion trigger
  const handleDeleteComment = async (amvId: string, commentId: string) => {
    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      // Inject double-failsafe admin secret header if the user is mestre or admin role
      if (currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'otakumestre')) {
        headersConfig["X-Admin-Secret"] = "1010";
      }

      // Add query param bypass
      const url = `/api/amvs/${amvId}/comments/${commentId}?adminSecret=1010`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: headersConfig
      });

      if (response.ok) {
        // Update local amv list to remove this comment
        setAmvList(prev => prev.map(a => {
          if (a.id === amvId) {
            return { ...a, comments: a.comments.filter(c => c.id !== commentId) };
          }
          return a;
        }));

        // Update active playing AMV comments list
        setSelectedAMV(prev => {
          if (prev && prev.id === amvId) {
            return { ...prev, comments: prev.comments.filter(c => c.id !== commentId) };
          }
          return prev;
        });

        showNotification("Comentário moderado e excluído!", "success");
      } else {
        const errData = await response.json();
        showNotification(errData.error || "Erro ao remover comentário.", "error");
      }
    } catch (err) {
      console.error("Delete comment failed:", err);
      showNotification("Erro na conexão ao excluir comentário.", "error");
    }
  };

  // Mass deletion handler for AMV posts
  const handleAmvBulkDelete = async (type: "selected" | "all") => {
    const isAll = type === "all";
    if (isAll) {
      if (!window.confirm("🔴 ATENÇÃO SHOGUN: Deseja realmente excluir TODOS os AMVs do catálogo global do clã?")) return;
    } else {
      if (selectedAmvIds.length === 0) {
        showNotification("Nenhum AMV selecionado para exclusão.", "info");
        return;
      }
      if (!window.confirm(`Deseja realmente excluir os ${selectedAmvIds.length} AMVs selecionados?`)) return;
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
          type: "amvs",
          ids: isAll ? "all" : selectedAmvIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(isAll ? "Todos os AMVs foram deletados com sucesso!" : "AMVs selecionados foram excluídos da database!", "success");
        setAmvList(data.amvs || []);
        setSelectedAmvIds([]);
        setIsAmvSelectMode(false);
      } else {
        const errData = await response.json();
        showNotification(errData.error || "Erro ao processar exclusão em massa das AMVs.", "error");
      }
    } catch (err) {
      console.error("AMV bulk delete failed:", err);
      showNotification("Erro ao se conectar ao servidor geral do clã.", "error");
    }
  };

  // Mass deletion handler for AMV comments
  const handleCommentBulkDelete = async (amvId: string, type: "selected" | "all", commentIds?: string[]) => {
    const isAll = type === "all";
    if (isAll) {
      if (!window.confirm("🔴 ATENÇÃO SHOGUN: Deseja realmente remover todos os comentários deste AMV?")) return;
    } else {
      if (!commentIds || commentIds.length === 0) {
        showNotification("Nenhum comentário selecionado.", "info");
        return;
      }
      if (!window.confirm(`Deseja realmente excluir os ${commentIds.length} comentários selecionados?`)) return;
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
          type: "comments",
          amvId,
          ids: isAll ? "all" : commentIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification(isAll ? "Todos os comentários removidos!" : "Comentários excluídos com sucesso!", "success");
        
        // Dynamic state updates across catalogs
        setAmvList(prev => prev.map(a => {
          if (a.id === amvId) {
            return { ...a, comments: data.comments || [] };
          }
          return a;
        }));

        if (selectedAMV && selectedAMV.id === amvId) {
          setSelectedAMV(prev => prev ? { ...prev, comments: data.comments || [] } : null);
        }
      } else {
        const errData = await response.json();
        showNotification(errData.error || "Falha na exclusão centralizada de comentários.", "error");
      }
    } catch (err) {
      console.error("Bulk comment deletion system error:", err);
      showNotification("Conectividade de rede perdida com o painel central.", "error");
    }
  };

  // Compute actual list filtered values
  const getFilteredAMVs = () => {
    let list = [...amvList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.creator.toLowerCase().includes(q) ||
        a.animes.some(anime => anime.toLowerCase().includes(q)) ||
        a.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Style filter
    if (filterStyle !== "All") {
      list = list.filter(a => a.style === filterStyle);
    }

    // Quality filter
    if (filterQuality !== "All") {
      list = list.filter(a => a.quality === filterQuality);
    }

    // Anime focus filter
    if (filterAnime !== "All") {
      list = list.filter(a => a.animes.includes(filterAnime));
    }

    // Sorting
    if (sortBy === "views") {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === "likes") {
      list.sort((a, b) => b.likes - a.likes);
    } else {
      // default: newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  };

  const filteredAMVs = getFilteredAMVs();

  // Get distinct anime titles in active catalog to populate quick selectors
  const allAnimesInCatalog = Array.from(new Set(amvList.flatMap(a => a.animes)));

  const renderActiveTabContent = () => {
    // If playing an AMV, prioritize TheaterMode over standard tabs!
    if (selectedAMV) {
      return (
        <TheaterMode
          amv={selectedAMV}
          onBack={() => {
            setSelectedAMV(null);
            loadAMVs(); // Refresh stats on return
          }}
          currentUser={currentUser}
          onLike={handleLikeAMV}
          onDislike={handleDislikeAMV}
          onAddComment={handleAddComment}
          isAdmin={currentUser.role === 'admin'}
          onDeleteRequest={handleDeleteAMV}
          onDeleteComment={handleDeleteComment}
          onBulkDeleteComments={handleCommentBulkDelete}
        />
      );
    }

    switch (activeTab) {
      case "explore":
        return (
          <div className="space-y-6">
            
            {/* Exploration header and filters drawer */}
            <div className="border-b border-white/10 pb-4 mb-4">
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5 font-display">
                <Compass className="text-fuchsia-450 text-fuchsia-500 w-8 h-8 animate-spin-slow" />
                <span>Explorar Acervo</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1.5">
                Filtre por animes específicos, estilos artísticos preferidos ou nível de resolução.
              </p>
            </div>

            {/* Filter Controls layout bar */}
            <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Search field */}
                <div className="relative">
                  <label className="block text-[10px] uppercase font-bold text-fuchsia-400/90 mb-1.5 font-mono tracking-wider">Buscar Editores/Animes</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Naruto, lofi, fight..."
                      className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 pl-9 text-xs text-zinc-100 outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Style dropdown */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-fuchsia-400/90 mb-1.5 font-mono tracking-wider">Estilo (Corte)</label>
                  <select
                    value={filterStyle}
                    onChange={(e) => setFilterStyle(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-100 outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all cursor-pointer"
                  >
                    <option value="All" className="bg-[#050505]">Todos os Estilos</option>
                    <option value="Epic" className="bg-[#050505]">Epic (Hype/Tribute)</option>
                    <option value="Sad" className="bg-[#050505]">Sad (Emotion/Chills)</option>
                    <option value="Action" className="bg-[#050505]">Action (Fight edits)</option>
                    <option value="Romance" className="bg-[#050505]">Romance (Aesthetic/Vibe)</option>
                    <option value="Other" className="bg-[#050505]">Outros (Especiais)</option>
                  </select>
                </div>

                {/* Anime focus dropdown */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-fuchsia-400/90 mb-1.5 font-mono tracking-wider">Anime Específico</label>
                  <select
                    value={filterAnime}
                    onChange={(e) => setFilterAnime(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-100 outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all font-semibold cursor-pointer"
                  >
                    <option value="All" className="bg-[#050505]">Qualquer Anime</option>
                    {allAnimesInCatalog.map(anime => (
                      <option key={anime} value={anime} className="bg-[#050505]">{anime}</option>
                    ))}
                  </select>
                </div>

                {/* Sorting options */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-fuchsia-400/90 mb-1.5 font-mono tracking-wider">Ordernar Por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-100 outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(191,48,211,0.2)] transition-all font-mono font-bold cursor-pointer"
                  >
                    <option value="newest" className="bg-[#050505]">Mais Recentes</option>
                    <option value="views" className="bg-[#050505]">Mais Visualizados</option>
                    <option value="likes" className="bg-[#050505]">Mais Votados (Hype)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Results Grid */}
            {filteredAMVs.length === 0 ? (
              <div className="bg-zinc-900/30 border border-zinc-850 p-16 text-center text-zinc-500 rounded-3xl">
                Nenhum AMV coincide com os filtros ativos. Tente resetar seus termos de busca!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAMVs.map((amv) => {
                  const isSelected = selectedAmvIds.includes(amv.id);
                  return (
                    <AMVCard
                      key={amv.id}
                      amv={amv}
                      onWatch={handleWatchAMV}
                      isAdmin={currentUser.role === 'admin'}
                      onDeleteRequest={handleDeleteAMV}
                      onLike={handleLikeAMV}
                      isSelectMode={isAmvSelectMode}
                      isSelected={isSelected}
                      onSelectToggle={(id) => {
                        setSelectedAmvIds(prev => 
                          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                        );
                      }}
                    />
                  );
                })}
              </div>
            )}

          </div>
        );

      case "upload":
        return (
          <UploadForm
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            setShowAuthModal={setShowAuthModal}
            onUploadSuccess={() => {
              setActiveTab("home");
              loadAMVs();
            }}
            onShowNotification={showNotification}
          />
        );

      case "ranking":
        return (
          <StatsDashboard
            amvList={amvList}
            onPlayAMV={(amv) => handleWatchAMV(amv)}
            onShowNotification={showNotification}
          />
        );

      case "chat":
        return (
          <ChatRoom
            currentUser={currentUser}
            onShowNotification={showNotification}
          />
        );

      case "home":
      default:
        // Home view segments: Featured on top carousel, Weekly Hot edits, then Recent
        const featuredAMV = amvList.length > 0 ? amvList[0] : null;
        const weeklyHot = [...amvList].sort((a, b) => b.views - a.views).slice(0, 3);
        const recentUploads = [...amvList].slice(0, 6);

        return (
          <div className="space-y-10">
            
            {/* Welcome banner slider card */}
            {featuredAMV && (
              <div 
                id="hero-banner-card"
                className="relative h-[250px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5)] group flex items-end p-6 sm:p-10 text-left bg-black/40 backdrop-blur-md"
              >
                {/* Background high contrast fade */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={featuredAMV.thumbnailUrl} 
                    alt="Hero poster image" 
                    className="w-full h-full object-cover opacity-45 filter group-hover:scale-102 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-transparent to-transparent" />
                </div>

                {/* Banner overlay tags and contents */}
                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="inline-flex bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-extrabold text-[9px] tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(192,38,211,0.3)] border border-fuchsia-500/20 font-mono">
                    🔥 DESTAQUE DA SEMANA
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-none font-display">
                    {featuredAMV.title}
                  </h2>
                  
                  <p className="text-zinc-300 text-xs sm:text-sm font-medium line-clamp-3 leading-relaxed">
                    Sincronizado primorosamente ao som de <strong className="text-white font-semibold">{featuredAMV.musicTitle}</strong>. Clique em assistir e experimente um visual extraordinário de {featuredAMV.animes.join(", ")}.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold">
                    <button
                      id="hero-watch-btn"
                      onClick={() => handleWatchAMV(featuredAMV)}
                      className="px-6 py-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-650 rounded-xl text-white font-black hover:shadow-[0_0_25px_rgba(192,38,211,0.5)] shadow-lg transition-all flex items-center space-x-2 tracking-wider uppercase text-xs font-display cursor-pointer"
                    >
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Assistir Agora</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAMV(featuredAMV.id);
                        }}
                        className="px-6 py-3 bg-red-950/40 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 flex items-center space-x-2 uppercase font-black text-xs font-display tracking-wider cursor-pointer"
                        title="Moderação: Excluir AMV Destaque"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir Destaque</span>
                      </button>
                    )}
                    
                    <span className="text-zinc-400 font-mono text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                      Postado por <strong className="text-fuchsia-400">@{featuredAMV.creator}</strong> • <strong>{featuredAMV.views}</strong> visualizações
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Hot bento grid */}
            <div className="space-y-4.5 pt-4">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="text-fuchsia-450 text-fuchsia-500 w-5 h-5 animate-pulse" />
                <h3 className="text-lg font-bold tracking-wider text-white uppercase font-display">
                  Mais vistos da semana
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyHot.map((amv) => {
                  const isSelected = selectedAmvIds.includes(amv.id);
                  return (
                    <AMVCard
                      key={`hot-${amv.id}`}
                      amv={amv}
                      onWatch={handleWatchAMV}
                      isAdmin={currentUser.role === 'admin'}
                      onDeleteRequest={handleDeleteAMV}
                      onLike={handleLikeAMV}
                      isSelectMode={isAmvSelectMode}
                      isSelected={isSelected}
                      onSelectToggle={(id) => {
                        setSelectedAmvIds(prev => 
                          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Recent list layout */}
            <div className="space-y-4.5 pt-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Flame className="text-cyan-400 w-5 h-5" />
                  <h3 className="text-lg font-bold tracking-wider text-white uppercase font-display">
                    Nômades recentes (Últimos Carregamentos)
                  </h3>
                </div>
                
                <button
                  onClick={() => {
                    setFilterStyle("All");
                    setActiveTab("explore");
                  }}
                  className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400 hover:text-fuchsia-300 flex items-center space-x-1.5 transition-colors"
                >
                  <span>Ver todo acervo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentUploads.map((amv) => {
                  const isSelected = selectedAmvIds.includes(amv.id);
                  return (
                    <AMVCard
                      key={`recent-${amv.id}`}
                      amv={amv}
                      onWatch={handleWatchAMV}
                      isAdmin={currentUser.role === 'admin'}
                      onDeleteRequest={handleDeleteAMV}
                      onLike={handleLikeAMV}
                      isSelectMode={isAmvSelectMode}
                      isSelected={isSelected}
                      onSelectToggle={(id) => {
                        setSelectedAmvIds(prev => 
                          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans select-none pb-12 flex flex-col justify-between relative overflow-x-hidden text-zinc-100">
      
      {/* Immersive ambient radial gradient glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_50%),radial-gradient(circle_at_0%_100%,#1e1530_0%,transparent_35%),radial-gradient(circle_at_100%_80%,#0c1a30_0%,transparent_35%)] opacity-55 z-0 pointer-events-none"></div>

      <div className="space-y-6 relative z-10 flex-grow">
        
        {/* Navigation Core */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedAMV(null); // Return to list view
          }}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          onShowNotification={showNotification}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
        />

        {/* Global Body Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {currentUser.role === 'admin' && activeTab !== "chat" && !selectedAMV && (
            <div className="bg-gradient-to-r from-amber-600/15 via-fuchsia-600/15 to-purple-600/15 border border-amber-500/25 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg backdrop-blur-md animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center space-x-3">
                <span className="p-2 py-1 bg-amber-500/15 text-amber-500 text-[10px] font-black tracking-widest uppercase border border-amber-500/30 rounded font-mono">
                  SHOGUN-CONTROLE
                </span>
                <div>
                  <h4 className="font-bold text-xs text-zinc-150">Painel de Exclusão em Massa de AMVs</h4>
                  <p className="text-[10px] text-zinc-400">Ative o modo de seleção para limpar múltiplos AMVs de uma só vez ou realizar o reset geral.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAmvSelectMode(!isAmvSelectMode);
                    setSelectedAmvIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isAmvSelectMode 
                      ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-md shadow-fuchsia-500/10" 
                      : "bg-zinc-900 hover:bg-zinc-800 border-white/15 text-zinc-250"
                  } cursor-pointer`}
                >
                  {isAmvSelectMode ? "Sair do Modo Excluir Vários" : "Excluir Vários AMVs"}
                </button>
                {isAmvSelectMode && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const currentShownIds = activeTab === "explore" ? filteredAMVs.map(x => x.id) : amvList.map(a => a.id);
                        if (selectedAmvIds.length === currentShownIds.length) {
                          setSelectedAmvIds([]);
                        } else {
                          setSelectedAmvIds(currentShownIds);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5 transition-all cursor-pointer"
                    >
                      {selectedAmvIds.length === (activeTab === "explore" ? filteredAMVs.length : amvList.length) ? "Desmarcar Todos" : "Selecionar Todos"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmvBulkDelete("selected")}
                      disabled={selectedAmvIds.length === 0}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-650 hover:bg-red-600 disabled:opacity-40 text-white transition-all uppercase cursor-pointer"
                    >
                      Excluir Selecionados ({selectedAmvIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmvBulkDelete("all")}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-950/45 border border-red-500/20 hover:bg-red-650 hover:text-white text-red-400 transition-all uppercase cursor-pointer"
                    >
                      Excluir TODOS
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {renderActiveTabContent()}
        </div>

      </div>

      {/* Global Toast Alert banner */}
      {notification.show && (
        <div 
          id="global-toast-alert"
          className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center space-x-2.5 p-4 rounded-2xl border backdrop-blur-md max-w-sm transition-all duration-300 bg-black/85 border-white/10 text-white shadow-[0_0_25px_rgba(192,38,211,0.25)] relative z-50"
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5 text-fuchsia-500 shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 animate-pulse" />}
          <p className="text-xs font-bold text-zinc-200">{notification.message}</p>
        </div>
      )}

      {/* Humble aesthetic footer */}
      <footer id="app-footer-bar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-auto text-center border-t border-white/5 text-xs text-gray-500 font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <p className="font-semibold text-gray-400">
          AMV HUBUSHIDO &copy; {new Date().getFullYear()} — Portal de Edições Cinematográficas • Clã Bushido
        </p>
        <div className="flex items-center justify-center sm:justify-end space-x-4">
          <p className="text-[10px] text-gray-500 tracking-wider">
            Infraestrutura ativa • Alimentado por Inteligência Artificial Gemini 3.5-flash
          </p>
          <button
            type="button"
            onClick={() => setShowAdminLoginModal(true)}
            className="flex items-center space-x-1 p-1 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 rounded text-[10px] text-zinc-500 hover:text-amber-400 transition-all cursor-pointer focus:outline-none"
            title="Acesso Administrativo (Chave)"
          >
            <Key className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </footer>

      {/* Discreet Admin Login Modal (Restricted access) */}
      {showAdminLoginModal && (
        <AdminLoginModal 
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={(userData, token) => {
            setCurrentUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem("hubushido_token", token);
            localStorage.setItem("hubushido_profile", JSON.stringify(userData));
            showNotification(`Bem-vindo, ${userData.username}! Poderes de Admin Shogun ativos.`, "success");
            setShowAdminLoginModal(false);
          }}
          onNotification={showNotification}
        />
      )}
    </div>
  );
}
