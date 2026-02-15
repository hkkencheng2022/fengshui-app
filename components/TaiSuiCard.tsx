import React from 'react';
import { calculateTaiSui, getAffectedBirthYears } from '../utils/fengshui';
import { ShieldAlert, Gem } from 'lucide-react';

interface TaiSuiCardProps {
  year: number;
}

export const TaiSuiCard: React.FC<TaiSuiCardProps> = ({ year }) => {
  const info = calculateTaiSui(year);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 mt-6 relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">犯太歲生肖提醒</h3>
          <p className="text-xs text-red-500 font-medium">太歲當頭坐，無喜必有禍</p>
        </div>
        <div className="ml-auto text-right">
           <span className="block text-xs text-gray-400">太歲生肖</span>
           <span className="text-2xl font-serif font-bold text-red-600">{info.yearSign}</span>
        </div>
      </div>

      <div className="space-y-3">
        {info.conflicts.map((item, idx) => {
          const birthYears = getAffectedBirthYears(item.sign, year);
          return (
            <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex gap-3 items-start">
              <div className="flex flex-col items-center justify-center min-w-[50px] pt-1">
                <div className="w-10 h-10 bg-white border-2 border-red-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-800 shadow-sm">
                  {item.sign}
                </div>
                <span className="text-[10px] font-bold text-red-500 mt-1 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 whitespace-nowrap">
                  {item.type}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="text-[10px] text-gray-400 mb-1 flex flex-wrap gap-1">
                   <span className="font-bold text-gray-500">出生年份:</span>
                   {birthYears.map(y => (
                     <span key={y} className="bg-white px-1 rounded border border-gray-200">{y}</span>
                   ))}
                </div>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100">
                  <Gem className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="font-medium">建議: {item.remedy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};