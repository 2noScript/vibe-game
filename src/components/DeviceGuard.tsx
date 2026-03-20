import React, { useState, useEffect } from 'react';
import { MonitorOff, Smartphone, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeviceGuardProps {
  children: React.ReactNode;
}

const DeviceGuard: React.FC<DeviceGuardProps> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024; // Standard desktop breakpoint

      // The user wants it to be a computer (not mobile/tablet) and not a small window (resize)
      if (isMobileDevice || isSmallScreen) {
        setIsSupported(false);
      } else {
        setIsSupported(true);
      }
    };

    // Initial check
    checkDevice();

    // Listen for resize
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050011] flex items-center justify-center p-6 font-pixel text-white text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 scanline" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md w-full border-4 border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex justify-center mb-8">
            <div className="relative">
              <MonitorOff size={64} className="text-red-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-black text-[10px] px-2 py-0.5 font-bold">
                ERROR 403
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black mb-4 tracking-tighter text-white">
            UNSUPPORTED <span className="text-red-500">DEVICE</span>
          </h1>

          <div className="space-y-4 text-xs text-zinc-400 leading-relaxed mb-8">
            <p>
              THIS SYSTEM REQUIRES A <span className="text-white">DESKTOP COMPUTER</span> FOR OPTIMAL PERFORMANCE AND CONTROL.
            </p>
            <p>
              MOBILE DEVICES, TABLETS, AND SMALL BROWSER WINDOWS ARE CURRENTLY <span className="text-red-400">NOT SUPPORTED</span>.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Smartphone size={24} />
              <span className="text-[8px]">MOBILE</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-emerald-500">
              <Laptop size={24} className="animate-bounce" />
              <span className="text-[8px]">DESKTOP</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-30">
              <Smartphone size={24} className="rotate-90" />
              <span className="text-[8px]">TABLET</span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-600 uppercase tracking-widest border-t border-white/5 pt-6">
            PLEASE SWITCH TO A DESKTOP OR ENLARGE YOUR WINDOW TO CONTINUE
          </div>
        </motion.div>

        <style>{`
          .scanline {
            animation: scan 4s linear infinite;
          }
          @keyframes scan {
            0% { top: -10%; }
            100% { top: 110%; }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default DeviceGuard;
