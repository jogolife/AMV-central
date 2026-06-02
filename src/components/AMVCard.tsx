/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Play, 
  ThumbsUp, 
  Eye, 
  Tv, 
  Music, 
  Clock, 
  Trash2,
  Sparkles
} from "lucide-react";
import { AMV } from "../types";

interface AMVCardProps {
  key?: string | number;
  amv: AMV;
  onWatch: (amv: AMV) => void;
  isAdmin: boolean;
  onDeleteRequest?: (id: string) => void;
  onLike?: (id: string) => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (id: string) => void;
}

export default function AMVCard({ 
  amv, 
  onWatch, 
  isAdmin, 
  onDeleteRequest, 
  onLike,
  isSelectMode = false,
  isSelected = false,
  onSelectToggle
}: AMVCardProps) {
  
  // Style-specific colors representing different aesthetic categories
  const styleBadges = {
    Epic: "border-amber-500/30 text-amber-500 bg-amber-500/10",
    Sad: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    Action: "border-red-500/30 text-red-500 bg-red-500/10",
    Romance: "border-pink-500/30 text-pink-400 bg-pink-500/10",
    Other: "border-zinc-700 text-zinc-400 bg-zinc-800/50"
  };

  const currentStyleBadge = styleBadges[amv.style] || styleBadges.Other;

  return (
    <div 
      id={`amv-card-${amv.id}`}
      onClick={() => {
        if (isSelectMode && onSelectToggle) {
          onSelectToggle(amv.id);
        }
      }}
      className={`group relative bg-white/5 border rounded-2xl overflow-hidden transition-all duration-300 transform flex flex-col h-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] font-sans ${
        isSelectMode 
          ? "cursor-pointer active:scale-[0.98] select-none" 
          : "hover:bg-white/10 hover:border-fuchsia-500/35 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(192,38,211,0.1)]"
      } ${
        isSelectMode && isSelected 
          ? "border-fuchsia-500 ring-2 ring-fuchsia-500 bg-fuchsia-950/15 shadow-[0_0_20px_rgba(192,38,211,0.35)]" 
          : "border-white/5"
      }`}
    >
      {/* Thumbnail block with hovering play layer */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img 
          src={amv.thumbnailUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(amv.title)}`} 
          alt={amv.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            // fallback if custom thumbnail fails to load
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60`;
          }}
        />
        
        {/* Play trigger overlay */}
        {!isSelectMode && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              id={`watch-overlay-${amv.id}`}
              onClick={() => onWatch(amv)}
              className="p-3.5 bg-gradient-to-br from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 rounded-full text-white shadow-[0_0_20px_rgba(192,38,211,0.5)] transform scale-90 group-hover:scale-100 transition duration-300"
            >
              <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Checkbox indicator in Selection mode */}
        {isSelectMode && (
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="w-4.5 h-4.5 rounded border-zinc-700 bg-black/75 text-fuchsia-400 focus:ring-fuchsia-500 accent-fuchsia-500 cursor-pointer shadow-lg"
            />
          </div>
        )}

        {/* Quality indicator on top-right */}
        <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] text-zinc-300 font-mono font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
          {amv.quality}
        </span>

        {/* Duration badge on bottom-right */}
        <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md border border-white/5 text-[9px] text-zinc-300 font-mono px-2 py-0.5 rounded-md flex items-center space-x-1 font-bold">
          <Clock className="w-3 h-3 text-fuchsia-400" />
          <span>{amv.duration}</span>
        </span>

        {/* Style category on top-left */}
        {!isSelectMode && (
          <span className={`absolute top-2.5 left-2.5 border text-[9px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md tracking-wider uppercase ${currentStyleBadge}`}>
            {amv.style}
          </span>
        )}
      </div>

      {/* Meta contents */}
      <div className="p-4 flex flex-col flex-1 text-white">
        
        {/* Creator Info */}
        <div className="flex items-center space-x-2 mb-2.5">
          <img 
            src={amv.creatorAvatar} 
            alt={amv.creator} 
            className="w-5.5 h-5.5 rounded-md border border-white/10 bg-black" 
          />
          <span className="text-zinc-400 text-xs font-semibold tracking-wide truncate max-w-[130px]" title={amv.creator}>
            @{amv.creator}
          </span>
          <span className="text-[9px] text-zinc-550 font-mono tracking-wider uppercase">• {new Date(amv.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>

        {/* Title */}
        <h4 
          onClick={() => onWatch(amv)}
          className="font-bold text-sm leading-snug text-zinc-100 hover:text-fuchsia-400 transition-colors line-clamp-2 cursor-pointer flex-1 font-display"
        >
          {amv.title}
        </h4>

        {/* Music Detail */}
        <div className="mt-3 flex items-center text-xs text-zinc-400 font-medium truncate bg-white/5 p-2 rounded-xl border border-white/5">
          <Music className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
          <span className="truncate tracking-wide text-[11px]">{amv.musicTitle} {amv.musicArtist ? `• ${amv.musicArtist}` : ""}</span>
        </div>

        {/* Anime badge list */}
        <div className="mt-3.5 text-left">
          <div className="text-[9px] uppercase font-bold text-zinc-500 mb-1.5 flex items-center space-x-1 tracking-wider font-mono">
            <Tv className="w-3 h-3 text-fuchsia-500" />
            <span>Animes Presentes</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {amv.animes.slice(0, 3).map((anime, index) => (
              <span 
                key={index} 
                className="bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-[10px] px-2.5 py-0.5 rounded-md transition duration-200 border border-white/5"
              >
                {anime}
              </span>
            ))}
            {amv.animes.length > 3 && (
              <span className="bg-black/40 text-fuchsia-400 font-mono text-[9px] px-1.5 py-0.5 rounded-md border border-fuchsia-500/20 font-bold">
                +{amv.animes.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Metrics footer & trigger buttons */}
        <div className="mt-4.5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1 hover:text-zinc-200 transition-colors">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>{amv.views.toLocaleString()}</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onLike) onLike(amv.id);
              }}
              className="flex items-center space-x-1 text-fuchsia-400 hover:text-fuchsia-350 hover:scale-110 active:scale-95 transition-all duration-250 cursor-pointer p-0.5 rounded focus:outline-none"
              title="Curtir AMV"
            >
              <ThumbsUp className="w-3.5 h-3.5 fill-fuchsia-500/10 text-fuchsia-500" />
              <span>{amv.likes.toLocaleString()}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isSelectMode ? (
              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                isSelected 
                  ? "bg-fuchsia-600 border-fuchsia-500 text-white shadow-[0_0_10px_rgba(192,38,211,0.35)] animate-pulse" 
                  : "bg-black/30 border-white/10 text-zinc-400"
              }`}>
                {isSelected ? "Selecionado" : "Selecionar"}
              </span>
            ) : (
              <>
                {/* Delete button (only display visual admin delete button or let admins exercise deletions) */}
                {isAdmin && onDeleteRequest && (
                  <button
                    id={`delete-btn-${amv.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRequest(amv.id);
                    }}
                    className="p-1.5 px-2 rounded-lg bg-red-950/20 hover:bg-red-950 border border-red-500/10 hover:border-red-500/40 text-red-400 transition-colors cursor-pointer"
                    title="Excluir AMV (Admin Power)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id={`watch-now-${amv.id}`}
                  onClick={() => onWatch(amv)}
                  className="px-3.5 py-1 bg-fuchsia-600/10 hover:bg-fuchsia-600 border border-fuchsia-500/20 hover:border-fuchsia-500 text-fuchsia-400 hover:text-white rounded-lg text-xs font-bold transition duration-300 flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>Assistir</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
