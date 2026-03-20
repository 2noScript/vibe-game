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
import Home from './pages/home';
import DeviceGuard from './components/DeviceGuard';
import './styles/index.css';
import { ArrowLeft } from 'lucide-react';

const GameWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const BackButton = () => (
    <button
      onClick={handleBackToHome}
      title="BACK TO HUB"
      className="absolute top-4 left-4 z-[100] flex items-center justify-center w-10 h-10 bg-black/40 backdrop-blur-md text-white border-2 border-white/20 opacity-40 transition-all hover:opacity-100 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 active:scale-95 group"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
    </button>
  );

  if (id === 'cyber-strike') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <CyberStrike />
      </div>
    );
  }

  if (id === 'void-explorer') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <VoidExplorer />
      </div>
    );
  }

  if (id === 'pixel-quest') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <PixelQuest />
      </div>
    );
  }

  if (id === 'synth-racer') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <SynthRacer />
      </div>
    );
  }

  if (id === 'data-miner') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <DataMiner />
      </div>
    );
  }

  if (id === 'super-jumper') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <SuperJumper />
      </div>
    );
  }

  if (id === 'gold-miner') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <GoldMiner />
      </div>
    );
  }

  if (id === 'streets-of-rage') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <StreetsOfRage />
      </div>
    );
  }

  if (id === 'contra') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <BackButton />
        <Contra />
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
