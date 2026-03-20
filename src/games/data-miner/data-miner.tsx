import React, { useEffect } from 'react';
import { useStore } from './store';
import { BlockType } from './types';
import { audio } from './audio';
import { Battery, Zap, DollarSign, HardDrive, Cpu, ShieldAlert, FileDigit, Database, Server } from 'lucide-react';

const Block = ({ x, y, type, durability, revealed, isPlayer }: { x: number, y: number, type: BlockType, durability: number, revealed: boolean, isPlayer: boolean }) => {
  
  let color = 'bg-gray-900';
  let icon = null;
  let opacity = 'opacity-100';

  if (!revealed) {
    color = 'bg-black';
    opacity = 'opacity-0'; // Hidden
    // Actually, let's make hidden blocks just black
    return <div className="w-8 h-8 bg-black border border-gray-900/20" />;
  }

  switch (type) {
    case BlockType.EMPTY:
      color = 'bg-gray-900/50';
      break;
    case BlockType.CORRUPTED:
      color = 'bg-stone-700';
      break;
    case BlockType.DATA_PACKET:
      color = 'bg-cyan-900';
      icon = <FileDigit size={16} className="text-cyan-400" />;
      break;
    case BlockType.ENCRYPTED_FILE:
      color = 'bg-purple-900';
      icon = <Database size={16} className="text-purple-400" />;
      break;
    case BlockType.FIREWALL:
      color = 'bg-red-900';
      icon = <ShieldAlert size={16} className="text-red-500" />;
      break;
    case BlockType.CORE_FRAGMENT:
      color = 'bg-yellow-900';
      icon = <Cpu size={16} className="text-yellow-400" />;
      break;
    case BlockType.BEDROCK:
      color = 'bg-black';
      icon = <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#333_5px,#333_10px)]" />;
      break;
  }

  return (
    <div className={`w-8 h-8 ${color} border border-black/20 flex items-center justify-center relative`}>
      {icon}
      {durability > 1 && type !== BlockType.BEDROCK && (
        <div className="absolute bottom-0 right-0 text-[8px] text-white/50 px-1">
          {durability}
        </div>
      )}
      {isPlayer && (
        <div className="absolute inset-0 flex items-center justify-center z-10 animate-pulse">
          <div className="w-6 h-6 bg-green-500 rounded-sm shadow-[0_0_10px_#22c55e]" />
        </div>
      )}
    </div>
  );
};

const HUD = () => {
  const { player, message, upgrades, buyUpgrade, sellResources } = useStore();

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 p-4 flex flex-col gap-4 font-mono text-xs h-full overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-green-500 mb-2">DATA MINER</h2>
        <div className="text-gray-400">{message || 'SYSTEM READY'}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-yellow-400">
          <div className="flex items-center gap-2"><Battery size={16} /> ENERGY</div>
          <div>{Math.floor(player.energy)}/{player.maxEnergy}</div>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-300" 
            style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-green-400">
          <div className="flex items-center gap-2"><DollarSign size={16} /> CREDITS</div>
          <div>{player.credits}</div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <h3 className="text-gray-500 mb-2">INVENTORY</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(player.inventory).map(([type, count]) => (
            <div key={type} className="flex justify-between text-gray-300">
              <span className="truncate w-20" title={type}>{type.replace('_', ' ')}</span>
              <span>x{count}</span>
            </div>
          ))}
          {Object.keys(player.inventory).length === 0 && <div className="text-gray-600 italic">EMPTY</div>}
        </div>
        <button 
          onClick={() => { audio.init(); sellResources(); }}
          className="w-full mt-2 bg-green-900/50 hover:bg-green-900 text-green-400 py-2 border border-green-800 transition-colors"
        >
          SELL ALL / RECHARGE
        </button>
      </div>

      <div className="border-t border-gray-800 pt-4 flex-1">
        <h3 className="text-gray-500 mb-2">UPGRADES</h3>
        <div className="space-y-3">
          {Object.values(upgrades).map((upgrade) => (
            <div key={upgrade.id} className="bg-gray-800/50 p-2 border border-gray-700">
              <div className="flex justify-between text-white font-bold">
                <span>{upgrade.name}</span>
                <span className="text-gray-500">LVL {upgrade.level}</span>
              </div>
              <div className="text-gray-400 text-[10px] mb-1">{upgrade.description}</div>
              <button
                onClick={() => { audio.init(); buyUpgrade(upgrade.id as any); }}
                disabled={player.credits < upgrade.cost || upgrade.level >= upgrade.maxLevel}
                className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 text-white transition-colors"
              >
                <span>UPGRADE</span>
                <span>{upgrade.level >= upgrade.maxLevel ? 'MAX' : `${upgrade.cost} CR`}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DataMiner = () => {
  const { grid, player, initGame, move } = useStore();

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          move(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          move(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          move(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          move(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!grid.length) return <div className="text-white">LOADING SYSTEM...</div>;

  return (
    <div className="flex w-full h-screen bg-black text-white overflow-hidden">
      {/* Game View */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        <div className="relative bg-black border-4 border-gray-800 shadow-2xl">
          {grid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((block, x) => (
                <Block 
                  key={`${x}-${y}`} 
                  x={x} 
                  y={y} 
                  type={block.type} 
                  durability={block.durability} 
                  revealed={block.revealed}
                  isPlayer={player.x === x && player.y === y}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar HUD */}
      <HUD />
    </div>
  );
};

export default DataMiner;
