/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Flame, 
  Compass, 
  UploadCloud, 
  MessageSquare, 
  Award, 
  User, 
  Shield, 
  ShieldCheck,
  Check,
  Zap,
  LogIn,
  LogOut,
  Mail,
  Lock
} from "lucide-react";
import { CurrentUser } from "../types";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
}

const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Goku",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Naruto",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sasuke",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Luffy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zoro",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Mikasa",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zenitsu"
];

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  setCurrentUser,
  isAuthenticated,
  setIsAuthenticated,
  onShowNotification,
  showAuthModal,
  setShowAuthModal
}: NavigationProps) {
  // Profiles settings
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [inputName, setInputName] = useState(currentUser.username);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [updatePassword, setUpdatePassword] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Auth Portal States
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passInput, setPassInput] = useState("");
  const [nickInput, setNickInput] = useState("");
  const [registerAvatar, setRegisterAvatar] = useState(AVATARS[0]);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Sync inputs when currentUser changes (e.g. from app mount auto-auth)
  React.useEffect(() => {
    setInputName(currentUser.username);
    setSelectedAvatar(currentUser.avatar);
  }, [currentUser]);

  // Auth register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passInput || !nickInput.trim()) {
      onShowNotification("Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }
    setIsSubmittingAuth(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passInput,
          username: nickInput.trim(),
          avatar: registerAvatar
        })
      });

      const data = await response.json();
      if (!response.ok) {
        onShowNotification(data.error || "Erro ao registrar conta ninja.", "error");
      } else {
        localStorage.setItem("hubushido_token", data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        // Clear forms
        setEmailInput("");
        setPassInput("");
        setNickInput("");
        onShowNotification(`Bem-vindo ao Clã, @${data.user.username}! Conta criada!`, "success");
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Erro na conexão com os portões do Clã.", "error");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Auth login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passInput) {
      onShowNotification("Por favor, informe seu e-mail e sua senha secreta.", "error");
      return;
    }
    setIsSubmittingAuth(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passInput
        })
      });

      const data = await response.json();
      if (!response.ok) {
        onShowNotification(data.error || "Acesso negado: credenciais inválidas.", "error");
      } else {
        localStorage.setItem("hubushido_token", data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        // Clear fields
        setEmailInput("");
        setPassInput("");
        onShowNotification(`Acesso autorizado! Bem-vindo de volta, @${data.user.username}.`, "success");
      }
    } catch (err) {
      console.error(err);
      onShowNotification("Erro na conexão durante validação de senhas.", "error");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Profile Save Personalization handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    try {
      const token = localStorage.getItem("hubushido_token");
      const headersConfig: HeadersInit = { "Content-Type": "application/json" };
      if (token) headersConfig["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({
          username: inputName.trim(),
          avatar: selectedAvatar,
          ...(updatePassword.trim() ? { password: updatePassword.trim() } : {})
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser({
          ...data.user
        });
        onShowNotification("Perfil sincronizado com sucesso no templo Hubushido!", "success");
        setShowProfileModal(false);
        setUpdatePassword("");
        setAdminPass("");
      } else {
        onShowNotification(data.error || "Erro ao salvar perfil.", "error");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      onShowNotification("Falha ao salvar as modificações do ninjutsu.", "error");
    }
  };

  // Auth logout handler
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("hubushido_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout error quiet:", err);
    }

    // Reset client state
    localStorage.removeItem("hubushido_token");
    setIsAuthenticated(false);
    const mockGuestName = `Ronin_${Math.floor(Math.random() * 900) + 100}`;
    setCurrentUser({
      username: mockGuestName,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${mockGuestName}`,
      role: 'user'
    });
    
    setShowProfileModal(false);
    onShowNotification("Sessão finalizada. Desconectado com sucesso.", "info");
  };

  const handleToggleAdminDirectly = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser({
        ...currentUser,
        role: 'user'
      });
      onShowNotification("Modo Admin Desativado.", "info");
    } else {
      if (isAuthenticated) {
        setShowProfileModal(true);
      } else {
        onShowNotification("Para ativar moderação, registre-se primeiro!", "info");
        setAuthTab("register");
        setShowAuthModal(true);
      }
    }
  };

  return (
    <>
      <nav id="navbar-main" className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div 
              id="sidebar-logo" 
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => setActiveTab("home")}
            >
              <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 p-1.5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(192,38,211,0.4)]">
                <Flame className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-extrabold text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-fuchsia-500 font-display">
                HUBUSHIDO
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              <button
                id="nav-btn-home"
                onClick={() => setActiveTab("home")}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "home" 
                    ? "bg-fuchsia-650/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Destaque</span>
              </button>

              <button
                id="nav-btn-explore"
                onClick={() => setActiveTab("explore")}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "explore" 
                    ? "bg-fuchsia-650/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explorar</span>
              </button>

              <button
                id="nav-btn-upload"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "upload" 
                    ? "bg-fuchsia-650/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload AMV</span>
              </button>

              <button
                id="nav-btn-ranking"
                onClick={() => setActiveTab("ranking")}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "ranking" 
                    ? "bg-fuchsia-650/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>

              <button
                id="nav-btn-chat"
                onClick={() => setActiveTab("chat")}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative ${
                  activeTab === "chat" 
                    ? "bg-fuchsia-650/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(192,38,211,0.15)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
                <span className="absolute -top-1 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                </span>
              </button>
            </div>

            {/* Profile / Login Button widget */}
            <div className="flex items-center space-x-3">
              {/* Verified profile vs Login trigger */}
              {isAuthenticated ? (
                <div 
                  id="profile-dropdown-trigger"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-zinc-900/80 to-black/80 hover:from-zinc-800 hover:to-zinc-950 border border-fuchsia-500/15 p-1.5 pr-3 rounded-xl cursor-pointer transition-all duration-300"
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username} 
                    className="w-8 h-8 rounded-lg bg-zinc-950 border border-fuchsia-500/30" 
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white max-w-[90px] truncate">@{currentUser.username}</p>
                    <p className="text-[9px] text-zinc-400 font-mono tracking-wide uppercase flex items-center gap-0.5 animate-pulse">
                      {currentUser.role === 'admin' ? (
                        <span className="text-amber-500 font-semibold">Shogun (Admin)</span>
                      ) : (
                        <span className="text-fuchsia-400 font-bold">Ninja Elite</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  id="navbar-login-trigger"
                  onClick={() => {
                    setAuthTab("login");
                    setShowAuthModal(true);
                  }}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-red-650/20 to-fuchsia-650/20 hover:from-red-600 hover:to-fuchsia-655 text-white border border-red-500/30 hover:border-fuchsia-500 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile quick-bar navigation */}
        <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-md flex justify-around p-2 text-[10px]">
          <button 
            onClick={() => setActiveTab("home")} 
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${activeTab === 'home' ? 'text-fuchsia-400 bg-white/5' : 'text-gray-400'}`}
          >
            <Flame className="w-4 h-4" />
            <span className="mt-0.5 font-bold uppercase tracking-wider">Destaque</span>
          </button>
          <button 
            onClick={() => setActiveTab("explore")} 
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${activeTab === 'explore' ? 'text-fuchsia-400 bg-white/5' : 'text-gray-400'}`}
          >
            <Compass className="w-4 h-4" />
            <span className="mt-0.5 font-bold uppercase tracking-wider">Explorar</span>
          </button>
          <button 
            onClick={() => setActiveTab("upload")} 
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${activeTab === 'upload' ? 'text-fuchsia-400 bg-white/5' : 'text-gray-400'}`}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="mt-0.5 font-bold uppercase tracking-wider">Upload</span>
          </button>
          <button 
            onClick={() => setActiveTab("ranking")} 
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${activeTab === 'ranking' ? 'text-fuchsia-400 bg-white/5' : 'text-gray-400'}`}
          >
            <Award className="w-4 h-4" />
            <span className="mt-0.5 font-bold uppercase tracking-wider">Ranking</span>
          </button>
          <button 
            onClick={() => setActiveTab("chat")} 
            className={`flex flex-col items-center py-1 px-3 rounded-lg relative transition-colors ${activeTab === 'chat' ? 'text-fuchsia-400 bg-white/5' : 'text-gray-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="mt-0.5 font-bold uppercase tracking-wider">Chat</span>
            <span className="absolute top-1 right-3 inline-flex rounded-full h-1.5 w-1.5 bg-fuchsia-500"></span>
          </button>
        </div>
      </nav>

      {/* GORGEOUS INTEGRATED REGISTER & LOGIN MULTI-TAB MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-zinc-950 border border-red-500/30 text-white p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)] relative animate-fade-in">
            
            {/* Modal Header Tab Toggles */}
            <div className="flex border-b border-zinc-800 pb-3 mb-5">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 text-center font-bold pb-2 text-sm uppercase tracking-wider transition-colors ${
                  authTab === "login" 
                    ? "text-red-500 border-b-2 border-red-500" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Membro do Clã (Entrar)
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`flex-1 text-center font-bold pb-2 text-sm uppercase tracking-wider transition-colors ${
                  authTab === "register" 
                    ? "text-red-500 border-b-2 border-red-500" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Novo Recruta (Criar Conta)
              </button>
            </div>

            {/* Custom Description Text */}
            <p className="text-zinc-400 text-xs mb-4 leading-relaxed font-semibold">
              {authTab === "login" 
                ? "Entre com suas credenciais secretas para acessar os rankings e gerenciar suas AMVs."
                : "Realize seu cadastro para registrar suas AMVs, interagir no chat coletivo e personalizar seu perfil ninja."}
            </p>

            {/* Actual Form wrapper */}
            <form onSubmit={authTab === "login" ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1.5 font-bold flex items-center gap-1 flex-row">
                  <Mail className="w-3.5 h-3.5 text-zinc-450" /> Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1.5 font-bold flex items-center gap-1 flex-row">
                  <Lock className="w-3.5 h-3.5 text-zinc-450" /> Senha Secreta
                </label>
                <input
                  type="password"
                  required
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Insira sua senha..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono transition-all"
                />
              </div>

              {/* Extra Register Parameters */}
              {authTab === "register" && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1.5 font-bold flex items-center gap-1 flex-row">
                      <User className="w-3.5 h-3.5 text-zinc-450" /> Nome Ninja (Nickname)
                    </label>
                    <input
                      type="text"
                      required
                      value={nickInput}
                      onChange={(e) => setNickInput(e.target.value)}
                      placeholder="Ex: TakiMitsuha, SasukeEdits"
                      maxLength={18}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-bold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-2 font-bold">
                      Escolha seu Avatar Inicial
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegisterAvatar(av)}
                          className={`relative p-1 rounded-xl transition ${
                            registerAvatar === av 
                              ? 'bg-red-500/20 border-2 border-red-500' 
                              : 'border border-zinc-850 hover:border-zinc-800 bg-zinc-900'
                          }`}
                        >
                          <img src={av} alt="option" className="w-full h-10 rounded-lg" />
                          {registerAvatar === av && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  disabled={isSubmittingAuth}
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl py-2.5 text-xs font-bold transition uppercase tracking-wider font-display"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="flex-grow bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white rounded-xl py-2.5 text-xs font-black transition flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-[0_4px_12px_rgba(239,68,68,0.2)] font-display"
                >
                  {isSubmittingAuth ? (
                    <span className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>{authTab === "login" ? "Autorizar Acesso" : "Prestar Juramento"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* AUTHORIZED PROFILE MANAGEMENT & PERSONALIZATION MODAL */}
      {showProfileModal && isAuthenticated && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 text-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in font-display">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-row">
              <h3 className="text-xl font-bold flex items-center gap-2 flex-row">
                <User className="text-red-500" /> Painel de Personalização Ninja
              </h3>
              <button 
                onClick={handleLogout}
                title="Desconectar do Clã"
                className="flex items-center gap-1 flex-row text-[10px] font-bold text-red-500 hover:text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 font-sans text-left">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-405 text-zinc-400 mb-1 font-bold">
                  E-mail do Aluno
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email || "E-mail desconhecido"}
                  className="w-full bg-zinc-950 border border-zinc-800/50 rounded-xl p-2.5 text-sm text-zinc-500 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-405 text-zinc-400 mb-1 font-bold">
                  Nome na Vila (Nickname)
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Seu nickname..."
                  maxLength={18}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-bold animate-pulse"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-450 text-zinc-400 mb-1 font-bold">
                  Alterar Senha Secreta (Opcional)
                </label>
                <input
                  type="password"
                  value={updatePassword}
                  onChange={(e) => setUpdatePassword(e.target.value)}
                  placeholder="Nova senha secreta..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-450 text-zinc-400 mb-2 font-bold">
                  Escolha seu Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative p-1 rounded-xl transition ${selectedAvatar === av ? 'bg-red-500/20 border-2 border-red-500' : 'border border-zinc-800 hover:border-zinc-700 bg-zinc-950'}`}
                    >
                      <img src={av} alt="avatar option" className="w-full h-10 rounded-lg" />
                      {selectedAvatar === av && (
                        <span className="absolute -top-1 -right-1 bg-red-650 bg-red-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>



              <div className="flex space-x-2 pt-2 flex-row">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 text-xs font-bold transition uppercase tracking-wider font-display"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1 uppercase tracking-wider shadow font-display"
                >
                  <Zap className="w-4 h-4" /> Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
