import React from 'react';
import { calculateFlyingStarGrid, getGridLayout } from '../utils/fengshui';
import { STAR_DATA, DIRECTION_NAMES } from '../constants';
import { DirectionId } from '../types';
import { Info } from 'lucide-react';

interface GridProps {
  year: number;
  heading: number;
  alignCompass: boolean;
  onCellClick: (starNum: number, directionId: DirectionId) => void;
  gridRef?: React.RefObject<HTMLDivElement>;
}

export const Grid: React.FC<GridProps> = ({ year, heading, alignCompass, onCellClick, gridRef }) => {
  const centerStar = React.useMemo(() => {
    let star = (11 - (year % 9)) % 9;
    return star === 0 ? 9 : star;
  }, [year]);

  const starMap = React.useMemo(() => calculateFlyingStarGrid(centerStar), [centerStar]);
  const layout = getGridLayout(); // SE, S, SW, E, C, W, NE, N, NW (Traditional Top-South)

  // Rotation logic
  // If alignCompass is true, we rotate the container so the direction the user is facing is at the TOP.
  // Standard Layout is "South Top" (180 degrees at top).
  // If user faces South (180), South (180) should be at Top. No rotation needed relative to layout.
  // If user faces North (0), North (0) should be at Top.
  // The layout defines positions.
  // Let's assume the Grid Container has South at Top by default (Feng Shui style).
  // South is Top. Angle 180.
  // If User Heading is 180, we want 180 at top. Rotation = 0.
  // If User Heading is 0, we want 0 (North) at top. North is currently at Bottom. Rotation = 180.
  // Formula: Rotation = Heading - 180.
  
  const rotation = alignCompass ? heading - 180 : 0;

  return (
    <div className="relative mx-auto max-w-[360px] w-full aspect-square mb-8">
      {/* Compass rose/Outer ring for aesthetic */}
      <div className="absolute inset-[-10px] rounded-full border-2 border-dashed border-gold-200 opacity-20 pointer-events-none"></div>

      <div 
        ref={gridRef}
        className="w-full h-full grid grid-cols-3 gap-2 p-2 bg-indigo-50/50 rounded-xl transition-transform duration-700 ease-in-out border border-indigo-100 shadow-xl"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {layout.map((dirId) => {
          const starNum = starMap[dirId];
          const starInfo = STAR_DATA[starNum];
          const isCenter = dirId === 'C';

          return (
            <div
              key={dirId}
              onClick={() => onCellClick(starNum, dirId)}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg cursor-pointer transition-all duration-300
                hover:shadow-md hover:scale-[1.02]
                ${isCenter ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-white border border-gray-100'}
              `}
              // Counter-rotate text so it remains readable if grid rotates
              style={{ transform: `rotate(${-rotation}deg)` }}
            >
              <div className="absolute top-1 left-2 text-[10px] sm:text-xs font-bold text-gray-400 tracking-widest uppercase">
                {DIRECTION_NAMES[dirId]}
              </div>
              
              <div className={`text-4xl sm:text-5xl font-bold font-serif my-1 ${starInfo.color}`}>
                {starNum}
              </div>

              <div className="flex flex-col items-center">
                 <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${starInfo.auspicious ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                   {starInfo.auspicious ? '吉' : '凶'}
                 </div>
                 <div className="text-[10px] text-gray-400 mt-0.5 scale-90">
                    {starInfo.element === 'Wood' && '五行: 木'}
                    {starInfo.element === 'Fire' && '五行: 火'}
                    {starInfo.element === 'Earth' && '五行: 土'}
                    {starInfo.element === 'Metal' && '五行: 金'}
                    {starInfo.element === 'Water' && '五行: 水'}
                 </div>
              </div>
              
              {/* Info Icon for affordance */}
              <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                  <Info className="w-3 h-3 text-indigo-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};