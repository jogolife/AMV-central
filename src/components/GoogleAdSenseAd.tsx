import React, { useEffect, useState } from "react";
import { Sparkles, ArrowUpRight, ExternalLink } from "lucide-react";

interface GoogleAdSenseAdProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: "true" | "false";
  className?: string;
  variant?: "horizontal" | "vertical" | "square" | "inline";
}

// Immersive anime / AMV related premium sponsor ads list
const SITE_RELATED_ADS = [
  {
    id: "crunchyroll-promo",
    title: "Crunchyroll Premium - Assista sem Limites",
    description: "Assista aos mais novos episódios de anime diretamente do Japão em qualidade Ultra-HD. Experimente 14 dias grátis!",
    cta: "Garantir 14 Dias Grátis",
    url: "https://www.crunchyroll.com",
    badge: "STREAMING ANIME",
    glowColor: "from-orange-550 to-amber-500",
    bgColor: "bg-orange-500/10 border-orange-500/25",
    textColor: "text-orange-400",
    buttonStyle: "bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400",
    imgUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=420&auto=format&fit=crop&q=80" // anime visual
  },
  {
    id: "amv-edit-masterclass",
    title: "After Effects & Premiere para AMVs — Edit Pro",
    description: "Domine transições profissionais, sincronização cirúrgica de beats e efeitos visuais 3D para viralizar suas criações.",
    cta: "Acessar Cupom Shogun -45%",
    url: "https://www.adobe.com",
    badge: "CURSO EDITORES",
    glowColor: "from-fuchsia-600 to-purple-600",
    bgColor: "bg-fuchsia-500/10 border-fuchsia-500/25",
    textColor: "text-fuchsia-400",
    buttonStyle: "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500",
    imgUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=420&auto=format&fit=crop&q=80" // professional editing desk visual
  },
  {
    id: "bushido-katana-merch",
    title: "Loja Bushido — Réplicas de Katanas de Anime",
    description: "Garanta katanas realistas de aço carbono de Zoro, Tanjiro, Sasuke e Kokushibo com frete grátis nacional.",
    cta: "Ver Catálogo Bushido",
    url: "https://shopee.com.br",
    badge: "COLECIONÁVEIS CLÃ",
    glowColor: "from-red-650 to-amber-600",
    bgColor: "bg-red-500/10 border-red-500/25",
    textColor: "text-red-400",
    buttonStyle: "bg-gradient-to-r from-red-600 to-amber-500 text-white hover:from-red-500 hover:to-amber-400",
    imgUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=420&auto=format&fit=crop&q=80" // cool japanese sword aesthetic
  },
  {
    id: "manga-central",
    title: "Manga Reader Plus — Baixe os Volumes Completos",
    description: "Acompanhe continuações exclusivas de Solo Leveling, Jujutsu Kaisen e Chainsaw Man com tradução de alta fidelidade.",
    cta: "Ler Capítulos Novos",
    url: "https://wikipedia.org",
    badge: "MANGÁ HUB",
    glowColor: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-500/10 border-blue-500/25",
    textColor: "text-blue-400",
    buttonStyle: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400",
    imgUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=420&auto=format&fit=crop&q=80" // manga artwork graphic
  }
];

export default function GoogleAdSenseAd({
  slot,
  format = "auto",
  responsive = "true",
  className = "",
  variant = "horizontal"
}: GoogleAdSenseAdProps) {
  const [adSenseError, setAdSenseError] = useState(false);
  const [randomSponsor, setRandomSponsor] = useState(SITE_RELATED_ADS[0]);

  useEffect(() => {
    // Pick different random sponsor on component mount to keep ads dynamic
    const idx = Math.floor(Math.random() * SITE_RELATED_ADS.length);
    setRandomSponsor(SITE_RELATED_ADS[idx]);
  }, []);

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense script load status: AdSense is pending or adblocker is active. Displaying highly optimized local site sponsor ads.");
      setAdSenseError(true);
    }
  }, []);

  // Visual layout for Horizontal banner shape (e.g. at page headers / footers)
  if (variant === "horizontal") {
    return (
      <div className={`w-full ${className}`}>
        {/* Real AdSense Slot integration */}
        <div className="ads-slot-wrapper bg-black/45 rounded-2xl border border-white/5 overflow-hidden p-1 relative">
          <div className="absolute top-1 right-2 z-10 font-mono text-[8px] font-bold tracking-widest text-zinc-550 uppercase pointer-events-none select-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-ping" />
            Anúncio AdSense
          </div>
          
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "90px" }}
            data-ad-client="ca-pub-2750800370490797"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
          />
        </div>

        {/* Dynamic Fallback / Additional Related Ad Block right underneath or fallback display */}
        <div className={`mt-3 p-4 px-5 rounded-2xl border ${randomSponsor.bgColor} flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:scale-[1.005] duration-300 relative overflow-hidden shadow-lg backdrop-blur-md`}>
          <div className="absolute top-0 right-0 h-32 w-32 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Small decorative teaser thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0 hidden sm:block relative">
              <img src={randomSponsor.imgUrl} alt="Ad Visual" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className={`p-1 px-2.5 rounded text-[9px] font-black tracking-wider uppercase border border-white/5 bg-black/45 ${randomSponsor.textColor}`}>
                  #{randomSponsor.badge}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  Parceiro Oficial
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1 justify-center sm:justify-start">
                {randomSponsor.title}
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-550" />
              </h4>
              <p className="text-[11px] text-zinc-450 mt-1 max-w-xl">{randomSponsor.description}</p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a 
              href={randomSponsor.url} 
              target="_blank" 
              rel="noreferrer"
              className={`w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md transform hover:-translate-y-0.5 cursor-pointer ${randomSponsor.buttonStyle}`}
            >
              <span>{randomSponsor.cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Visual layout for compact square/inline ads (e.g. sidebars or content grids)
  return (
    <div className={`p-4.5 bg-black/55 rounded-2xl border border-white/5 flex flex-col h-full justify-between gap-4 select-none relative overflow-hidden backdrop-blur-md hover:border-white/15 transition-all ${className}`}>
      <div className="absolute top-[1.5px] right-[1.5px] p-1 bg-black/65 border-b border-l border-white/5 text-[9px] font-bold text-zinc-650 font-mono tracking-widest uppercase rounded-bl-xl">
        Patrocinado
      </div>

      <div className="space-y-3">
        {/* Real AdSense integrated here for sidebar/square views */}
        <div className="ads-slot-inner bg-black/40 rounded-xl overflow-hidden border border-white/5 p-0.5">
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-2750800370490797"
            data-ad-slot={slot}
            data-ad-format="rectangle,horizontal"
            data-full-width-responsive="true"
          />
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`p-0.5 px-2 bg-black/60 rounded text-[8px] font-black tracking-widest uppercase ${randomSponsor.textColor} border border-white/5`}>
              {randomSponsor.badge}
            </span>
          </div>

          <h5 className="font-bold text-xs text-zinc-200 line-clamp-1">{randomSponsor.title}</h5>
          <p className="text-[10px] sm:text-[11px] text-zinc-450 mt-1 line-clamp-2 leading-relaxed">{randomSponsor.description}</p>
        </div>
      </div>

      <a 
        href={randomSponsor.url} 
        target="_blank" 
        rel="noreferrer"
        className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-md ${randomSponsor.buttonStyle} cursor-pointer`}
      >
        <span>{randomSponsor.cta}</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
