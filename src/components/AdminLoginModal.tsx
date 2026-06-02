/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, ShieldAlert, Key, Loader2 } from "lucide-react";
import { CurrentUser } from "../types";

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: (user: CurrentUser, token: string) => void;
  onNotification: (msg: string, type: "success" | "info" | "error") => void;
}

export default function AdminLoginModal({ onClose, onSuccess, onNotification }: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      onNotification("Preencha todos os campos do pergaminho de login.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Backend expects email but supports username mapping for admin login
          email: username, 
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.user, data.token);
      } else {
        onNotification(data.error || "Acesso de administrador recusado.", "error");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      onNotification("Erro de conexão com o templo central.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div 
        id="admin-login-modal"
        className="w-full max-w-md bg-zinc-950 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.08)] relative animate-in fade-in zoom-in-95 duration-250 text-left"
      >
        {/* Floating background neon decor */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Key className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-extrabold uppercase tracking-widest text-[#f0f0f0] text-sm font-display">
              Chave Shogun (Restrito)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400 transition-colors focus:outline-none"
            title="Fechar portal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 border-y border-white/5 py-3">
          <div className="flex items-center space-x-2 text-amber-500/80 text-[10px] uppercase tracking-wider font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Alerta de Autenticação Shogun</span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Área de moderação secreta. Entre com as credenciais do Clã para habilitar o poder de ocultar comentários e AMVs da Arena.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Mestre das Sombras
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nome de moderador..."
              className="w-full bg-zinc-900 border border-white/10 focus:border-amber-500/45 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              Palavra de Passe (Chave)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Chave secreta..."
              className="w-full bg-zinc-900 border border-white/10 focus:border-amber-500/45 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 disabled:bg-amber-500/40 text-black font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <span>Confirmar Chave</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
