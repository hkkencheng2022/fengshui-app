import React, { useState } from 'react';
import { X, ThumbsUp, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { StarInfo, DirectionId } from '../types';
import { DIRECTION_NAMES } from '../constants';

interface StarModalProps {
  star: StarInfo | null;
  direction: DirectionId | null;
  onClose: () => void;
}

export const StarModal: React.FC<StarModalProps> = ({ star, direction, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!star || !direction) return null;

  const year = new Date().getFullYear(); // Or pass year from props if needed strictly, but current or selected context usually implies intent
  const promptText = `請詳細說明 ${DIRECTION_NAMES[direction]}方位 ${star.name} 的風水特性，並提供具體的現代居家開運佈局建議與禁忌。`;

  const handleCopyAndOpen = (url: string) => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {DIRECTION_NAMES[direction]}方位
            </h3>
            <h2 className={`text-2xl font-bold ${star.color} flex items-center gap-2`}>
              {star.number} {star.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Attributes */}
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${star.auspicious ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {star.auspicious ? '吉星' : '凶星'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
              五行屬{star.element === 'Wood' ? '木' : star.element === 'Fire' ? '火' : star.element === 'Earth' ? '土' : star.element === 'Metal' ? '金' : '水'}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm">
            {star.description}
          </p>

          {/* Recommendations (Text Only) */}
          <div className="space-y-3">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
              <ThumbsUp className="w-4 h-4 text-indigo-600" />
              開運建議
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {star.recommendations.map((rec, idx) => (
                <div key={idx} className="border-l-4 border-indigo-200 bg-indigo-50/50 p-3 rounded-r-lg">
                    <div className="font-bold text-indigo-900 text-sm mb-1">{rec.item}</div>
                    <div className="text-xs text-gray-600">{rec.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Taboos */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
             <h4 className="font-bold text-red-800 flex items-center gap-2 text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              避忌事項
            </h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {star.taboos.map((taboo, idx) => (
                <li key={idx}>{taboo}</li>
              ))}
            </ul>
          </div>

          {/* AI Search Integration */}
          <div className="border-t border-gray-100 pt-5 mt-2">
             <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
               <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  AI 智能風水諮詢
               </h4>
               <p className="text-xs text-gray-500 mb-3">
                 如果您需要更詳細的佈局建議，可以複製問題並詢問 DeepSeek 或 Gemini。
               </p>
               
               <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 mb-3 font-mono border border-gray-200 relative group">
                  {promptText}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     {copied && <span className="text-[10px] text-green-600 font-bold bg-white px-1 rounded shadow-sm">已複製</span>}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleCopyAndOpen('https://chat.deepseek.com/')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm active:scale-95"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    詢問 DeepSeek (推薦)
                  </button>
                  <button 
                    onClick={() => handleCopyAndOpen('https://gemini.google.com/')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 transition shadow-sm active:scale-95"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    詢問 Gemini
                  </button>
               </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-indigo-900 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-800 transition"
          >
            了解
          </button>
        </div>
      </div>
    </div>
  );
};