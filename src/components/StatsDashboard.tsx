/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Crown, 
  ThumbsUp, 
  Tv, 
  TrendingUp, 
  User,
  Users,
  Video,
  Eye,
  ArrowRight,
  Flame
} from "lucide-react";
import { AMV } from "../types";

interface RankedUser {
  rankNumber: number;
  username: string;
  amvCount: number;
  likesReceived: number;
  avatar: string;
  score: number;
  rankTitle: string;
}

interface StatsDashboardProps {
  amvList: AMV[];
  onPlayAMV: (amv: AMV) => void;
  onShowNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function StatsDashboard({ amvList, onPlayAMV, onShowNotification }: StatsDashboardProps) {
  const [rankingList, setRankingList] = useState<RankedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<RankedUser | null>(null);
  const [userAMVs, setUserAMVs] = useState<AMV[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dynamically calculated rankings based on database entries
  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/ranking");
      if (res.ok) {
        const data = await res.json();
        setRankingList(data);
        
        // Auto-select first rank to populate detailed profile by default
        if (data.length > 0 && !selectedUser) {
          handleSelectUser(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load rankings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [amvList]);

  const handleSelectUser = (user: RankedUser) => {
    setSelectedUser(user);
    // Find uploaded AMVs by this creator
    const filtered = amvList.filter(a => a.creator.toLowerCase() === user.username.toLowerCase());
    setUserAMVs(filtered);
  };

  // Compute generic community aggregates
  const totalViews = amvList.reduce((acc, a) => acc + a.views, 0);
  const totalLikes = amvList.reduce((acc, a) => acc + a.likes, 0);
  const distinctAnimes = Array.from(new Set(amvList.flatMap(a => a.animes))).length;

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 lg:px-8 pb-12 text-white animate-fade-in font-sans">
      
      {/* Page Title */}
      <div className="border-b border-white/10 pb-4 mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5 font-display">
          <Award className="text-fuchsia-450 text-fuchsia-500 w-8 h-8" />
          <span>Leaderboard dos Clans</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1.5">
          Ranking real de editores e estatísticas agregadas da comunidade global.
        </p>
      </div>

      {/* Community aggregate bento cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 backdrop-blur-md shadow-lg">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Total AMVs</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-0.5">{amvList.length}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 backdrop-blur-md shadow-lg">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Visualizações</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-0.5">{totalViews.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 backdrop-blur-md shadow-lg">
          <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Curtidas Clã</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-0.5">{totalLikes.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center space-x-3 backdrop-blur-md shadow-lg">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">Animes Cruzados</div>
            <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono mt-0.5">{distinctAnimes}</div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Leaderboard table (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-1.5 font-display">
              <TrendingUp className="text-fuchsia-400 w-5 h-5" />
              <span>Placar dos Shoguns / Editores</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Atualizado {new Date().toLocaleDateString("pt-BR")}</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm">
              Processando pergaminhos do clã...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
                    <th className="py-3 px-2">Rank</th>
                    <th className="py-3">Editor</th>
                    <th className="py-3 text-center">Vídeos</th>
                    <th className="py-3 text-center">Curtidas</th>
                    <th className="py-3 text-right">Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {rankingList.map((user, idx) => {
                    const isSelected = selectedUser?.username === user.username;
                    
                    // Specific rank highlights
                    let rankBadge = "text-zinc-400";
                    let rankIconColor = "text-zinc-455 text-zinc-400";
                    if (idx === 0) {
                      rankBadge = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
                      rankIconColor = "text-amber-500";
                    } else if (idx === 1) {
                      rankBadge = "bg-zinc-350/10 text-zinc-300 border border-zinc-400/20";
                      rankIconColor = "text-zinc-300";
                    } else if (idx === 2) {
                      rankBadge = "bg-orange-500/10 text-orange-400 border border-orange-500/20";
                      rankIconColor = "text-orange-500";
                    }

                    return (
                      <tr 
                        key={user.username}
                        onClick={() => handleSelectUser(user)}
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-white/10 font-semibold" 
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3.5 px-2 font-mono">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${rankBadge}`}>
                            {idx < 3 ? (
                              <Crown className={`w-3.5 h-3.5 ${rankIconColor}`} />
                            ) : (
                              idx + 1
                            )}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={user.avatar} 
                              alt={user.username} 
                              className="w-8 h-8 rounded-lg bg-black border border-white/10" 
                            />
                            <div>
                              <p className="font-bold text-zinc-200">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-zinc-300">{user.amvCount}</td>
                        <td className="py-3.5 text-center font-mono text-fuchsia-400">+{user.likesReceived}</td>
                        <td className="py-3.5 text-right font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            idx === 0 
                              ? "border-amber-500/30 text-amber-400 bg-amber-500/10" 
                              : idx === 1 
                                ? "border-zinc-500/30 text-zinc-300 bg-zinc-800/10" 
                                : idx === 2 
                                  ? "border-orange-500/30 text-orange-400 bg-orange-800/10"
                                  : "border-white/5 text-zinc-505 text-zinc-500 bg-black/35"
                          }`}>
                            {user.rankTitle}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Editor Deep profile portfolio inspector (Spans 1 column) */}
        <div>
          {selectedUser ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6 shadow-2xl space-y-6 backdrop-blur-md">
              
              {/* Header profile */}
              <div className="text-center space-y-3 pb-4 border-b border-white/5">
                <div className="relative inline-block">
                  <img 
                    src={selectedUser.avatar} 
                    alt={selectedUser.username} 
                    className="w-16 h-16 rounded-2xl mx-auto bg-black border border-white/10 p-1" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 border border-black rounded-full p-1 text-white">
                    <User className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-lg text-zinc-100 font-display">@{selectedUser.username}</h3>
                  <span className="inline-block bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] font-black font-mono uppercase px-2.5 py-0.5 rounded-full mt-1">
                    {selectedUser.rankTitle}
                  </span>
                </div>

                {/* Score aggregate */}
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 flex justify-around text-center mt-3">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Seguidores</p>
                    <p className="text-sm font-black text-zinc-300 font-mono mt-0.5">
                      {((selectedUser.score % 100) + 24).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px bg-white/5 my-1" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Ranking</p>
                    <p className="text-sm font-black text-fuchsia-400 font-mono mt-0.5">#{selectedUser.rankNumber}</p>
                  </div>
                  <div className="w-px bg-white/5 my-1" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 font-mono">Score Clã</p>
                    <p className="text-sm font-black text-amber-500 font-mono mt-0.5">{selectedUser.score}</p>
                  </div>
                </div>
              </div>

              {/* Creator AMVs Catalog */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#a8a8af] flex items-center gap-1 font-mono">
                  <Flame className="w-4 h-4 text-fuchsia-500 animate-pulse" /> Catalogado por @{selectedUser.username}
                </h4>

                {userAMVs.length === 0 ? (
                  <div className="text-xs text-zinc-500 p-4 border border-white/5 border-dashed rounded-xl text-center">
                    Editor compôs uploads em contas anteriores ou é um curador apenas de debate.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {userAMVs.map(amv => (
                      <div 
                        key={amv.id}
                        onClick={() => onPlayAMV(amv)}
                        className="group bg-black/35 p-2.5 rounded-xl border border-white/5 hover:border-fuchsia-500/30 hover:bg-black/50 transition cursor-pointer flex items-center space-x-3 shadow-sm hover:shadow-[0_4px_12px_rgba(192,38,211,0.15)]"
                      >
                        <img 
                          src={amv.thumbnailUrl} 
                          alt="amv thumbnail" 
                          className="w-12 aspect-video object-cover rounded-lg bg-black shrink-0 border border-white/5" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-zinc-300 group-hover:text-fuchsia-400 transition line-clamp-1">{amv.title}</p>
                          <span className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5 inline-block">
                            {amv.style} • {amv.views} views
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-fuchsia-400 transform group-hover:translate-x-0.5 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white/5 p-12 text-center text-zinc-500 italic rounded-2xl border border-white/5 shadow-md">
              Selecione um editor ao lado para inspecionar seus pergaminhos.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
