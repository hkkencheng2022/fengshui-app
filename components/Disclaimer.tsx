import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-indigo-900 mb-6">
          免責聲明
        </h1>

        <div className="text-gray-600 text-sm space-y-4 mb-8 bg-gray-50 p-4 rounded-xl max-h-60 overflow-y-auto">
          <p>1. 本服務基於傳統民俗文化九宮飛星理論設計，內容僅供文化參考與生活趣味。</p>
          <p>2. 風水效果無科學實證，請勿替代專業醫療、建築安全或心理諮詢。</p>
          <p>3. 植物擺放請注意寵物/兒童安全，避免選用有毒品種（如滴水觀音）。</p>
          <p>4. 本程式不收集個人位置資料，指南針數據僅於瀏覽器本地處理。</p>
          <p>5. 手機指南針精度受環境磁場影響，建議多次測量取平均值。</p>
        </div>

        <div className="flex items-center gap-3 mb-6 select-none cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
            {isChecked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-gray-700 font-medium text-sm">我已詳細閱讀並同意上述聲明</span>
        </div>

        <button
          disabled={!isChecked}
          onClick={onAccept}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            isChecked 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform hover:scale-[1.02]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          開始使用
        </button>
      </div>
    </div>
  );
};