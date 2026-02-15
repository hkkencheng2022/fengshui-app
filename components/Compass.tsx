import React from 'react';
import { RotateCw, Lock } from 'lucide-react';
import { getMountainInfo } from '../utils/fengshui';
import { MOUNTAINS, DIRECTION_TRIGRAMS } from '../constants';

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

  // SVG Configuration
  const size = 400; // ViewBox size
  const center = size / 2;
  
  // Rings Config
  const r_outer = 195; // Border
  const r_degree_ticks = 185;
  const r_mountains_bg = 180;
  const r_mountains_text = 155; // 24 Mountains Text Radius
  const r_trigrams_bg = 130;
  const r_trigrams_text = 105; // Trigrams Text Radius
  const r_center_pool = 70; // Heaven Pool

  // Render 24 Mountains Ring
  const renderMountains = () => {
    return MOUNTAINS.map((m, i) => {
      // m.angle is the center angle. 
      // The segment spans 15 degrees.
      // We want to rotate text to be upright or radial. Radial is standard for Lo Pan.
      // SVG 0 degrees is 3 o'clock (East). Compass 0 is North (Top).
      // Conversion: SVG_Angle = Compass_Angle - 90.
      // But we are rotating the whole group by -heading.
      // Let's position text at m.angle (0 for North/Zi).
      
      const isCardinal = ['N', 'S', 'E', 'W'].includes(m.direction);
      const isCorner = ['NE', 'SE', 'SW', 'NW'].includes(m.direction);
      
      // Color logic based on standard Lo Pan aesthetics (Red/Black/Gold)
      // Simplifying for readability: Red for Yang/Major, Black for others
      // Or simply alternating for visual clarity.
      // Let's use red for the Trigram owners (N, S, E, W...) to pop.
      const isRed = ['子', '午', '卯', '酉', '乾', '坤', '艮', '巽'].includes(m.name);

      return (
        <g key={m.name} transform={`rotate(${m.angle}, ${center}, ${center})`}>
          {/* Divider Lines */}
          <line 
            x1={center} y1={center - r_mountains_bg} 
            x2={center} y2={center - r_trigrams_bg} 
            stroke="#D1C4A8" 
            strokeWidth="1.5"
            transform={`rotate(7.5, ${center}, ${center})`} 
          />
          
          {/* Text: Positioned at top (North relative to group), pointed inwards */}
          <text
            x={center}
            y={center - r_mountains_text}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isRed ? '#C8102E' : '#2D3748'}
            className="font-serif font-bold text-lg" // Tailwind classes don't always work inside SVG in all bundlers, but we use standard SVG attrs too
            style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: '"Noto Serif TC", serif' }}
            transform={`rotate(180, ${center}, ${center - r_mountains_text})`} // Rotate text to face center (standard) or 0 to face out
          >
            {m.name}
          </text>
        </g>
      );
    });
  };

  // Render 8 Trigrams (Bagua)
  const renderTrigrams = () => {
    // Trigrams are every 45 degrees.
    // N (Kan), NE (Gen), E (Zhen), SE (Xun), S (Li), SW (Kun), W (Dui), NW (Qian)
    // Mapping comes from DIRECTION_TRIGRAMS
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    
    return dirs.map((dir, i) => {
      const angle = i * 45;
      // @ts-ignore
      const name = DIRECTION_TRIGRAMS[dir]; 
      
      return (
        <g key={dir} transform={`rotate(${angle}, ${center}, ${center})`}>
           {/* Divider Lines */}
           <line 
            x1={center} y1={center - r_trigrams_bg} 
            x2={center} y2={center - r_center_pool} 
            stroke="#D1C4A8" 
            strokeWidth="2"
            transform={`rotate(22.5, ${center}, ${center})`} 
          />

          <text
            x={center}
            y={center - r_trigrams_text}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8B4513"
            style={{ fontSize: '32px', fontWeight: '900', fontFamily: '"Noto Serif TC", serif' }}
             transform={`rotate(180, ${center}, ${center - r_trigrams_text})`}
          >
            {name}
          </text>
        </g>
      );
    });
  };

  // Render Degree Ticks
  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 360; i+=5) {
       const isMajor = i % 15 === 0;
       ticks.push(
         <line
           key={i}
           x1={center} y1={center - r_outer + (isMajor ? 2 : 5)}
           x2={center} y2={center - r_outer + (isMajor ? 12 : 8)}
           stroke="#718096"
           strokeWidth={isMajor ? 2.5 : 1.5}
           transform={`rotate(${i}, ${center}, ${center})`}
         />
       );
    }
    return ticks;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg mb-6 border border-gray-100 overflow-hidden">
      
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
        
        {/* Lo Pan Visual - SVG Based */}
        {/* Adjusted size: w-[75vw] and max-w-[320px] to prevent it from being too large */}
        <div className="relative w-[75vw] h-[75vw] max-w-[320px] max-h-[320px] mb-6 select-none mx-auto">
          
          {/* 0. Static Background Plate (Square Base) */}
          <div className="absolute inset-[-8px] sm:inset-[-12px] bg-[#5c1c1c] rounded-2xl shadow-2xl border-4 border-[#3d1212]">
             <div className="absolute inset-0 border border-[#ffffff33] m-1 rounded-xl"></div>
          </div>
          
          {/* 1. Static Red Crosshair (Heaven Heart Cross) */}
          {/* Z-Index reduced to 30 to stay below App Header (Z-50) */}
          <div className="absolute inset-0 z-30 pointer-events-none">
             {/* Main Vertical (Facing) Line - Reduced top extension to prevent header overlap visual */}
             <div className="absolute top-[-15px] left-1/2 w-[1px] h-[110%] bg-red-600 -translate-x-1/2 shadow-sm z-50"></div>
             {/* Main Horizontal Line */}
             <div className="absolute top-1/2 left-[-10px] w-[105%] h-[1px] bg-red-600 -translate-y-1/2 z-40 shadow-sm"></div>
             {/* Arrow */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-600 z-50 filter drop-shadow"></div>
          </div>

          {/* 2. Rotating SVG Dial - Z-Index 10 */}
          <div 
             className="absolute inset-0 rounded-full transition-transform duration-500 ease-out z-10 shadow-xl bg-[#FDF5E6]"
             style={{ transform: `rotate(${-heading}deg)` }}
          >
             <svg 
               viewBox={`0 0 ${size} ${size}`} 
               className="w-full h-full"
             >
                {/* Background Color */}
                <circle cx={center} cy={center} r={center} fill="#FDF5E6" />
                
                {/* Outer Ring Border */}
                <circle cx={center} cy={center} r={r_outer} fill="none" stroke="#D1C4A8" strokeWidth="3" />
                
                {/* Ticks */}
                <g>{renderTicks()}</g>

                {/* 24 Mountains Ring */}
                <circle cx={center} cy={center} r={r_mountains_bg} fill="none" stroke="#D1C4A8" strokeWidth="1.5" />
                <g>{renderMountains()}</g>

                {/* Trigrams Ring */}
                <circle cx={center} cy={center} r={r_trigrams_bg} fill="none" stroke="#D1C4A8" strokeWidth="1.5" />
                <g>{renderTrigrams()}</g>

                {/* Center Pool */}
                <circle cx={center} cy={center} r={r_center_pool} fill="#FFFFFF" stroke="#D1C4A8" strokeWidth="1.5" />
                {/* Tiny Center Dot */}
                <circle cx={center} cy={center} r={3} fill="#C8102E" />
             </svg>
             
             {/* Inner Gloss */}
             <div className="absolute inset-0 rounded-full ring-1 ring-black/5 shadow-[inset_0_0_30px_rgba(139,69,19,0.15)] pointer-events-none"></div>
          </div>
        </div>

        {/* Info Display (Current Reading) */}
        <div className="text-center mb-6 p-4 bg-orange-50 rounded-xl w-full border border-orange-100 flex justify-between items-center shadow-sm">
            <div className="text-left">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">度數 (Degree)</div>
              <div className="text-3xl font-bold text-gray-900 font-serif">
                {Math.round(heading).toString().padStart(3, '0')}°
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 font-serif flex items-baseline justify-end gap-2">
                 <span className="text-lg text-orange-800 bg-orange-100 px-2 rounded border border-orange-200">{mountainInfo.trigram}卦</span>
                 <span>{mountainInfo.name}<span className="text-sm text-gray-500 font-sans ml-1">山</span></span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                 {mountainInfo.direction}方 (坐{mountainInfo.sitting}向{mountainInfo.name})
              </div>
            </div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-4">
          
          {isManual ? (
            <div className="space-y-4 animate-fade-in">
              
              {/* Quick Select Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                   快速選擇二十四山
                </label>
                <div className="relative">
                  <select
                    value={mountainInfo.name}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const mountain = MOUNTAINS.find(m => m.name === selectedName);
                      if (mountain) {
                        onHeadingChange(mountain.angle);
                      }
                    }}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer hover:bg-white transition"
                  >
                    {MOUNTAINS.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}山 ({m.start}° - {m.start > m.end ? m.end : m.end}°) - 坐{m.sitting}向{m.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Fine Tuning Slider */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex justify-between">
                   <span>旋轉羅盤 (微調)</span>
                   <span>{heading.toFixed(1)}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="0.5"
                  value={heading}
                  onChange={(e) => onHeadingChange(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                * 左右滑動調整角度，以對齊家中實際方位
              </p>
            </div>
          ) : (
             <button
             onClick={onRequestPermission}
             className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition flex justify-center items-center gap-2"
           >
             <RotateCw className="w-4 h-4" />
             校準/啟動指南針 (iOS需點擊)
           </button>
          )}

        </div>
      </div>
    </div>
  );
};