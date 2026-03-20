/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import CyberStrike from './games/cyber-strike/cyber-strike';
import VoidExplorer from './games/void-explorer/void-explorer';
import PixelQuest from './games/pixel-quest/pixel-quest';
import SynthRacer from './games/synth-racer/synth-racer';
import DataMiner from './games/data-miner/data-miner';
import SuperJumper from './games/super-jumper/super-jumper';
import GoldMiner from './games/gold-miner/gold-miner';
import StreetsOfRage from './games/streets-of-rage/streets-of-rage';
import Contra from './games/contra/contra';
import SuperMario from './games/super-mario/super-mario';
import ZombiePlant from './games/zombie-plant/zombie-plant';
import Home from './pages/home';
import DeviceGuard from './components/device-guard';
import './styles/index.css';
import { ArrowLeft, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GameWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '.') {
        navigate('/');
      }
      if (e.key === '?' && document.activeElement?.tagName !== 'INPUT') {
        setIsShortcutsModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const BackButton = () => (
    <button
      onClick={handleBackToHome}
      title="BACK TO HUB [.]"
      className="absolute top-4 left-4 z-[100] flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md text-white border-2 border-white/20 opacity-40 transition-all hover:opacity-100 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 active:scale-95 group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="absolute -bottom-6 left-0 text-[8px] font-pixel text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">BACK [.]</span>
    </button>
  );

  const HelpButton = () => (
    <button
      onClick={() => setIsShortcutsModalOpen(true)}
      title="HELP [?]"
      className="absolute top-4 right-4 z-[100] flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md text-white border-2 border-white/20 opacity-40 transition-all hover:opacity-100 hover:bg-blue-500 hover:text-black hover:border-blue-400 active:scale-95 group"
    >
      <Info size={20} />
      <span className="absolute -bottom-6 right-0 text-[8px] font-pixel text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-right">HELP [?]</span>
    </button>
  );

  const ShortcutsModal = () => (
    <AnimatePresence>
      {isShortcutsModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsShortcutsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-zinc-900 border-4 border-emerald-500 p-8 pixel-border shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-pixel text-emerald-400">SYSTEM SHORTCUTS</h2>
              <button onClick={() => setIsShortcutsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 font-pixel">
              <div className="flex justify-between items-center group">
                <span className="text-[10px] text-zinc-400">BACK TO HUB</span>
                <span className="bg-emerald-500 text-black px-3 py-1 text-xs border-2 border-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">.</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[10px] text-zinc-400">TOGGLE SHORTCUTS HELP</span>
                <span className="bg-emerald-500 text-black px-3 py-1 text-xs border-2 border-emerald-400 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">?</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[10px] text-zinc-400">CLOSE MODAL</span>
                <span className="bg-zinc-700 text-white px-3 py-1 text-xs border-2 border-zinc-600 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">ESC</span>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t-2 border-white/5 text-center">
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest">NEON PROTOCOL V1.0.42 // INPUT_MAPPING_ACTIVE</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (id === 'cyber-strike') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <CyberStrike />
      </div>
    );
  }

  if (id === 'void-explorer') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <VoidExplorer />
      </div>
    );
  }

  if (id === 'pixel-quest') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <PixelQuest />
      </div>
    );
  }

  if (id === 'synth-racer') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <SynthRacer />
      </div>
    );
  }

  if (id === 'data-miner') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <DataMiner />
      </div>
    );
  }

  if (id === 'super-jumper') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <SuperJumper />
      </div>
    );
  }

  if (id === 'gold-miner') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <GoldMiner />
      </div>
    );
  }

  if (id === 'streets-of-rage') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <StreetsOfRage />
      </div>
    );
  }

  if (id === 'contra') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <Contra />
      </div>
    );
  }

  if (id === 'super-mario') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <SuperMario />
      </div>
    );
  }

  if (id === 'zombie-plant') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <HelpButton />
        <ShortcutsModal />
        <ZombiePlant />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050011] flex flex-col items-center justify-center p-10 font-pixel text-white">
      <h1 className="text-2xl mb-4">GAME NOT FOUND</h1>
      <button 
        onClick={handleBackToHome}
        className="bg-emerald-500 text-black px-4 py-2 pixel-button-shadow"
      >
        RETURN TO HUB
      </button>
    </div>
  );
};

function App() {
  React.useEffect(() => {
    document.title = "vibe game";
  }, []);

  return (
    <Router>
      <DeviceGuard>
        <div className="w-full min-h-screen bg-[#050011]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:id" element={<GameWrapper />} />
          </Routes>
        </div>
      </DeviceGuard>
    </Router>
  );
}

export default App;
