import React, { useMemo } from 'react';
import { RotateCw, Lock } from 'lucide-react';
import { MOUNTAINS } from '../constants';
import { getMountainInfo } from '../utils/fengshui';

interface CompassProps {
  heading: number;
  isManual: boolean;
  onHeadingChange: (heading: number) => void;
  onToggleMode: () => void;
  onRequestPermission?: () => void;
}

export const Compass: React.FC<CompassProps> = ({
  heading,
  isManual,
  onHeadingChange,
  onToggleMode,
  onRequestPermission
}) => {
  
  const mountainInfo = getMountainInfo(heading);

  // Generate degree ticks (memoized for performance)
  const degreeTicks = useMemo(() => {
    const ticks = [];
    // Render a tick every 2 degrees
    for (let i = 0; i < 360; i += 2) {
      const isMajor = i % 10 === 0;
      const isCardinal = i % 90 === 0;
      
      ticks.push(
        <div
          key={i}
          className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
          style={{ 
            height: '50%', // Reaches from edge to center
            transform: `rotate(${i}deg)` 
          }}
        >
          {/* Tick Line: Outer Edge */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 ${
              isCardinal ? 'h-2.5 w-0.5 bg-red-600 z-10' : 
              isMajor ? 'h-2 w-[1.5px] bg-gray-800' : 
              'h-1 w-[1px] bg-gray-400'
            }`}
          />
          
          {/* Degree Numbers: Positioned just inside the ticks */}
          {/* Rotated 180 degrees relative to the tick so top of number points to center (Top-In/Outside Reading) */}
          {i % 10 === 0 && (
            <div 
               className={`absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold ${isCardinal ? 'text-red-600' : 'text-gray-600'}`}
               style={{ transform: `translateX(-50%) rotate(180deg)` }}
            >
              {i}
            </div>
          )}
        </div>
      );
    }
    return ticks;
  }, []);

  // Helper to render the 24 mountain characters ring
  const renderDial = () => {
    return (
      <div className="absolute inset-0 rounded-full">
        {MOUNTAINS.map((m, i) => {
          return (
            <div
              key={m.name}
              className="absolute top-0 left-0 w-full h-full text-center pointer-events-none"
              style={{ transform: `rotate(${m.angle}deg)` }}
            >
              {/* Mountain Name: Rotate 180 to be Top-In (readable from outside) */}
              <div className="pt-10 text-sm font-serif font-bold text-gray-900 drop-shadow-sm">
                 <div style={{ transform: 'rotate(180deg)' }}>{m.name}</div>
              </div>
              
              {/* Divider lines between mountains */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[0.5px] h-4 bg-amber-700/30" 
                   style={{ transform: `rotate(7.5deg) translateY(24px)` }}></div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const angle = Number(e.target.value);
    onHeadingChange(angle);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            專業風水羅盤
          </h2>
          <div className="text-xs text-gray-500">
            {isManual ? '手動定位模式' : '電子羅盤模式'}
          </div>
        </div>
       
        <button
          onClick={onToggleMode}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
            isManual 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {isManual ? <Lock className="w-3 h-3" /> : <RotateCw className="w-3 h-3 animate-spin-slow" />}
          {isManual ? '手動' : '自動'}
        </button>
      </div>

      <div className="flex flex-col items-center">
        
        {/* Lo Pan Visual */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8 select-none">
          
          {/* 0. Static Background Plate */}
          <div className="absolute inset-[-10px] bg-red-950 rounded-xl rotate-0 z-0 shadow-2xl border-4 border-red-900">
             <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-yellow-500/50"></div>
             <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-yellow-500/50"></div>
             <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-yellow-500/50"></div>
             <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-yellow-500/50"></div>
          </div>
          
          {/* 1. Static Red Crosshair (Heaven Heart Cross) - Fixed to Phone */}
          <div className="absolute inset-0 z-40 pointer-events-none">
             {/* Main Vertical (Facing) Line */}
             <div className="absolute top-[-20px] left-1/2 w-[1.5px] h-[110%] bg-red-600 -translate-x-1/2 shadow-sm z-50"></div>
             {/* Main Horizontal Line */}
             <div className="absolute top-1/2 left-[-10px] w-[108%] h-[1px] bg-red-600/50 -translate-y-1/2 z-40"></div>
             
             {/* Arrow head at top */}
             <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-red-600 z-50"></div>
          </div>

          {/* 2. Rotating Dial Container */}
          <div 
             className="absolute inset-0 rounded-full bg-[#fdfbf7] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden transition-transform duration-500 ease-out z-10 border border-gray-300"
             style={{ transform: `rotate(${-heading}deg)` }}
          >
             {/* Outer Edge Gradient */}
             <div className="absolute inset-0 rounded-full border-[2px] border-gray-400"></div>

             {/* Ring A: Degree Ticks (Outermost) */}
             <div className="absolute inset-1 rounded-full">
               {degreeTicks}
             </div>

             {/* Ring B: 24 Mountains (Middle) */}
             <div className="absolute inset-12 rounded-full border border-gray-300 bg-amber-50/30">
               {renderDial()}
             </div>
             
             {/* Ring C: Inner Decoration */}
             <div className="absolute inset-28 rounded-full border border-gray-200 opacity-50"></div>

             {/* 3. Center Pool (Tian Chi) */}
             <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-[3px] border-gray-200 shadow-inner flex items-center justify-center overflow-hidden">
                 {/* Decorative Red Dot */}
                 <div className="w-1.5 h-1.5 bg-red-600 rounded-full z-20 shadow-sm"></div>
                 
                 {/* Magnetic Needle Simulation */}
                 <div className="absolute w-1 h-14 bg-gray-200 rounded-full z-10"></div>
                 {/* Needle points to North (0 deg on dial) always relative to dial */}
                 <div className="absolute w-1.5 h-8 bg-red-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-full rounded-t-full z-10 mix-blend-multiply shadow-sm"></div>
                 <div className="absolute w-1.5 h-8 bg-black/80 top-1/2 left-1/2 -translate-x-1/2 rounded-b-full z-10 shadow-sm"></div>
                 
                 {/* Two yellow lines in pool */}
                 <div className="absolute w-full h-[1px] bg-yellow-400/50 rotate-90"></div>
             </div>
          </div>

        </div>

        {/* Info Display (Current Reading) */}
        <div className="text-center mb-6 p-4 bg-indigo-50 rounded-xl w-full border border-indigo-100 flex justify-between items-center">
            <div className="text-left">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Current Heading</div>
              <div className="text-3xl font-bold text-indigo-900 font-serif">
                {Math.round(heading).toString().padStart(3, '0')}°
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 font-serif">
                 {mountainInfo.name}<span className="text-sm text-gray-500 font-sans ml-1">山</span>
              </div>
              <div className="text-xs text-gray-500">
                 {mountainInfo.direction}方
              </div>
            </div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-4">
          
          {isManual ? (
            <div className="space-y-4 animate-fade-in">
              {/* Quick Select 24 Mountains */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  快速選擇二十四山
                </label>
                <div className="relative">
                  <select 
                    value={mountainInfo.angle}
                    onChange={handleManualSelect}
                    className="w-full p-3 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block appearance-none font-serif"
                  >
                    {MOUNTAINS.map(m => (
                      <option key={m.name} value={m.angle}>
                        {m.name}山 ({m.start}° - {m.end}°) - 坐{m.sitting}向{m.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Fine Tuning Slider */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex justify-between">
                   <span>微調角度</span>
                   <span>{heading.toFixed(1)}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.5"
                  value={heading}
                  onChange={(e) => onHeadingChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          ) : (
             <button
             onClick={onRequestPermission}
             className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition flex justify-center items-center gap-2"
           >
             <RotateCw className="w-4 h-4" />
             校準指南針 (iOS需點擊)
           </button>
          )}

        </div>
      </div>
    </div>
  );
};