import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Info, Gamepad2, Rocket, Zap, Heart, Search, Filter, X, ChevronDown, Github, Youtube, Music, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { games } from '@/games';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  Thumbnail: React.FC<{ className?: string }>;
  onPlay: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, description, image, tags, Thumbnail, onPlay, isFavorite, onToggleFavorite }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative bg-zinc-900 p-1 pixel-border-white h-full flex flex-col"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <Thumbnail 
          className="h-full w-full opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isFavorite && (
            <div className="bg-rose-500 px-2 py-1 text-[8px] font-bold text-white border-2 border-rose-400 font-pixel shadow-[0_0_10px_rgba(244,63,94,0.5)]">
              FAVORITE
            </div>
          )}
          {tags.includes('LOCKED') ? (
            <div className="bg-zinc-800 px-2 py-1 text-[8px] font-bold text-zinc-500 border-2 border-zinc-700 font-pixel">
              LOCKED
            </div>
          ) : (
            <div className="bg-emerald-500 px-2 py-1 text-[8px] font-bold text-black border-2 border-emerald-400 font-pixel animate-pulse">
              LIVE
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-zinc-900 flex-grow flex flex-col">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.filter(t => t !== 'LOCKED').map((tag) => (
            <span
              key={tag}
              className="bg-emerald-500/10 px-2 py-0.5 text-[7px] font-bold uppercase text-emerald-400 border border-emerald-500/30 font-retro"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mb-2 text-xs font-bold text-white group-hover:text-emerald-400 transition-colors font-pixel leading-tight">
          {title}
        </h3>
        <p className="mb-6 text-[9px] text-zinc-500 font-retro uppercase tracking-tight leading-relaxed flex-grow">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => !tags.includes('LOCKED') && onPlay(id)}
              disabled={tags.includes('LOCKED')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[9px] font-bold transition-all font-pixel",
                tags.includes('LOCKED') 
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50" 
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 active:translate-y-1 pixel-button-shadow active:pixel-button-shadow-active"
              )}
            >
              <Play size={10} fill="currentColor" />
              {tags.includes('LOCKED') ? 'LOCKED' : 'START'}
            </button>
            <button
              onClick={() => onToggleFavorite(id)}
              className={cn(
                "p-2 border-2 transition-all active:translate-y-0.5",
                isFavorite 
                  ? "bg-rose-500/20 border-rose-500 text-rose-500" 
                  : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-rose-400 hover:border-rose-400/50"
              )}
            >
              <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          
          <div className="flex gap-2 text-zinc-600">
            <Trophy size={14} className="hover:text-amber-500 cursor-help transition-colors" />
            <Info size={14} className="hover:text-blue-500 cursor-help transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gemini-arcade-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  const handlePlay = (id: string) => {
    navigate(`/game/${id}`);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id];
      localStorage.setItem('gemini-arcade-favorites', JSON.stringify(next));
      return next;
    });
  };

  const allTags = useMemo(() => {
    const tags = new Set(['ALL', 'FAVORITES']);
    games.forEach(game => game.tags.forEach(tag => tag !== 'LOCKED' && tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'ALL' 
        ? true 
        : selectedTag === 'FAVORITES' 
          ? favorites.includes(game.id)
          : game.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag, favorites]);

  return (
    <div className="min-h-screen bg-[#050011] text-zinc-100 selection:bg-emerald-500 selection:text-black font-retro pb-20">
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header Section */}
        <header className="mb-12 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-black tracking-tighter sm:text-6xl font-pixel text-white"
          >
            VIBE <span className="text-emerald-400">GAME</span>
          </motion.h1>
          
          <div className="flex justify-center gap-6 text-[10px] text-zinc-500 mb-8 font-pixel">
            <a href="#" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.966 2.419-2.156 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
              </svg>
              DISCORD
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01-.01 2.62-.02 5.24-.02 7.86 0 .62-.03 1.24-.15 1.85-.44 2.16-2.31 3.88-4.52 4.13-2.34.27-4.73-1.07-5.67-3.23-.91-2.05-.28-4.69 1.54-6.03.98-.74 2.12-1.14 3.35-1.14.13 0 .26.01.39.02.01 1.31.01 2.62.02 3.93-.12-.01-.25-.02-.38-.02-1.27-.04-2.51.72-3.01 1.89-.54 1.26-.06 2.82 1.11 3.47.7.4 1.5.46 2.25.24.75-.22 1.32-.79 1.58-1.53.11-.31.15-.64.15-.97V.02z"/>
              </svg>
              TIKTOK
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
              <Youtube size={14} className="group-hover:scale-110 transition-transform" />
              YOUTUBE
            </a>
            <a href="#" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
              <Github size={14} className="group-hover:scale-110 transition-transform" />
              GITHUB
            </a>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-zinc-900/50 p-6 border-2 border-white/5 backdrop-blur-sm">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
            </div>
            <input
              type="text"
              placeholder="SEARCH PROGRAMS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border-2 border-zinc-800 px-12 py-3 text-[10px] font-pixel text-emerald-400 placeholder:text-zinc-700 focus:border-emerald-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tag Filter Desktop */}
          <div className="hidden lg:flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "px-3 py-2 text-[8px] font-bold uppercase transition-all font-pixel border-2 flex items-center gap-2",
                  selectedTag === tag 
                    ? "bg-emerald-500 text-black border-emerald-400" 
                    : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                )}
              >
                {tag}
                {tag === 'FAVORITES' && favorites.length > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[7px] border",
                    selectedTag === 'FAVORITES' ? "bg-black text-emerald-400 border-emerald-400" : "bg-rose-500 text-white border-rose-400"
                  )}>
                    {favorites.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center justify-center gap-2 bg-zinc-800 px-4 py-3 text-[10px] font-pixel border-2 border-zinc-700"
          >
            <Filter size={14} />
            FILTER: {selectedTag}
            <ChevronDown size={14} className={cn("transition-transform", isFilterOpen && "rotate-180")} />
          </button>
        </div>

        {/* Mobile Filter Menu */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden mb-8 overflow-hidden bg-zinc-900 border-2 border-zinc-800 p-4 grid grid-cols-2 gap-2"
            >
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setIsFilterOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 text-[8px] font-bold uppercase font-pixel border-2",
                    selectedTag === tag 
                      ? "bg-emerald-500 text-black border-emerald-400" 
                      : "bg-black text-zinc-500 border-zinc-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between font-pixel">
          <div className="text-[10px] text-zinc-500">
            SHOWING <span className="text-emerald-400">{filteredGames.length}</span> PROGRAMS
          </div>
          {selectedTag !== 'ALL' && (
            <button 
              onClick={() => setSelectedTag('ALL')}
              className="text-[8px] text-zinc-600 hover:text-rose-500 flex items-center gap-1"
            >
              <X size={10} /> CLEAR FILTERS
            </button>
          )}
        </div>

        {/* Game Grid */}
        {filteredGames.length > 0 ? (
          <motion.div 
            layout
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  {...game} 
                  onPlay={handlePlay} 
                  isFavorite={favorites.includes(game.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center border-4 border-dashed border-white/5"
          >
            <Search size={48} className="mx-auto mb-6 text-zinc-800" />
            <h2 className="text-xl font-pixel text-zinc-700 mb-2">NO PROGRAMS FOUND</h2>
            <p className="text-[10px] text-zinc-800 font-pixel">TRY ADJUSTING YOUR SEARCH PARAMETERS</p>
          </motion.div>
        )}

        {/* Stats Footer */}
        <div className="mt-32 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'PLAYERS', value: '1234', icon: Heart, color: 'text-rose-500' },
            { label: 'GAMES', value: '09', icon: Gamepad2, color: 'text-emerald-500' },
            { label: 'RANK', value: '42', icon: Trophy, color: 'text-amber-500' },
            { label: 'STATUS', value: 'OK', icon: Rocket, color: 'text-cyan-500' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center bg-zinc-900/30 p-4 border-2 border-white/5"
            >
              <stat.icon className={cn("mb-3", stat.color)} size={16} />
              <span className="text-lg font-bold text-white font-pixel">{stat.value}</span>
              <span className="mt-2 text-[7px] font-bold uppercase tracking-widest text-zinc-700 font-pixel">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-32 border-t-2 border-white/5 pt-16 pb-12 font-pixel">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 mb-16">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-6">SYSTEM</h3>
              <ul className="space-y-3 text-[9px] text-zinc-500">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">ABOUT VIBE</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">CORE ENGINE</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">PATCH NOTES</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">DEVELOPER API</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-6">GAMES</h3>
              <ul className="space-y-3 text-[9px] text-zinc-500">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">ARCADE CLASSICS</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">3D SIMULATIONS</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">CYBERPUNK ACTION</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">PUZZLE GRID</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-6">COMMUNITY</h3>
              <ul className="space-y-3 text-[9px] text-zinc-500">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">DISCORD SERVER</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">TIKTOK FEED</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">YOUTUBE CHANNEL</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">GITHUB REPO</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-6">LEGAL</h3>
              <ul className="space-y-3 text-[9px] text-zinc-500">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">PRIVACY POLICY</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">TERMS OF SERVICE</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">COOKIE SETTINGS</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">SECURITY</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap size={14} className="text-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white tracking-tighter">VIBE GAME HUB</p>
                <p className="text-[7px] text-zinc-600 uppercase">EST. 2026 // NEON PROTOCOL</p>
              </div>
            </div>

            <div className="text-center md:text-right space-y-2">
              <p className="text-[8px] text-zinc-700 uppercase tracking-widest">
                © 2026 <a href="https://github.com/2noScript" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 underline underline-offset-2 transition-colors">2noScript</a>. ALL RIGHTS RESERVED.
              </p>
              <p className="text-[7px] text-zinc-800 uppercase tracking-widest">
                SYSTEM VERSION 1.0.42 // ENCRYPTION ACTIVE // SECURE_LINK_ESTABLISHED
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
