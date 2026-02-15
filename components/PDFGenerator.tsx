import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2, FileText } from 'lucide-react';
import { StarInfo, DirectionId } from '../types';
import { calculateCenterStar, calculateFlyingStarGrid, getGridLayout, getMountainInfo, calculateTaiSui } from '../utils/fengshui';
import { STAR_DATA, DIRECTION_NAMES, MOUNTAINS } from '../constants';

interface PDFGeneratorProps {
  gridRef: React.RefObject<HTMLDivElement>; // Kept for interface compatibility
  year: number;
  heading: number;
  alignCompass?: boolean;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ year, heading, alignCompass = false }) => {
  const [loading, setLoading] = React.useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Pre-calculate data for the report
  const centerStar = calculateCenterStar(year);
  const starMap = calculateFlyingStarGrid(centerStar);
  const mountainInfo = getMountainInfo(heading);
  const layout = getGridLayout(); // SE, S, SW... order
  const taiSuiInfo = calculateTaiSui(year);

  const rotation = alignCompass ? heading - 180 : 0;

  const handleExport = async () => {
    if (!reportRef.current) return;
    setLoading(true);

    try {
      const reportEl = reportRef.current;
      
      // --- Auto-Pagination Logic ---
      // 1. Reset any previous layout adjustments
      const items = reportEl.querySelectorAll('.pdf-item');
      items.forEach((item: any) => item.style.marginTop = '');

      // 2. Constants
      // A4 width in pixels at 96 DPI is approx 794px.
      // A4 Height = 794 * 1.414 = ~1123px.
      const PAGE_HEIGHT = 1123; 
      const reportRect = reportEl.getBoundingClientRect();
      const reportTop = reportRect.top;

      // 3. Iterate and adjust
      // We must loop sequentially because pushing an item down affects the position of subsequent items.
      for (let i = 0; i < items.length; i++) {
          const item = items[i] as HTMLElement;
          const rect = item.getBoundingClientRect();
          
          // Calculate position relative to the report top
          // We use Math.floor to tolerate sub-pixel differences
          const top = rect.top - reportTop;
          const bottom = rect.bottom - reportTop;
          
          const startPage = Math.floor(top / PAGE_HEIGHT);
          const endPage = Math.floor(bottom / PAGE_HEIGHT);

          // If the item crosses a page boundary
          if (startPage !== endPage) {
             // Calculate how much we need to push it down so it starts on the next page
             const nextPageStart = (startPage + 1) * PAGE_HEIGHT;
             // Add a buffer (e.g., 40px) so it doesn't touch the very edge
             const pushDownAmount = nextPageStart - top + 40;
             
             // Apply margin-top. 
             // Note: This modifies the live DOM of the hidden report, which forces a reflow for subsequent items immediately.
             item.style.marginTop = `${pushDownAmount}px`;
          }
      }
      // --- End Pagination Logic ---

      // 4. Capture
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // negative offset to move image up
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${year}年_九宮飛星風水報告.pdf`);

    } catch (err) {
      console.error("PDF Export failed", err);
      alert("匯出報告失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-900 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 text-xs sm:text-sm font-bold shadow-sm border border-indigo-100"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? '生成報告中...' : '下載詳細報告'}
      </button>

      {/* 
        HIDDEN REPORT TEMPLATE 
      */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '-10000px', 
          left: '-10000px',
          width: '794px', // A4 pixel width
          minHeight: '1123px', // A4 pixel height
          background: 'white',
          fontFamily: "'Noto Sans TC', sans-serif"
        }}
      >
        <div ref={reportRef} className="p-12 text-gray-800 bg-white">
          
          {/* Report Header */}
          <div className="border-b-4 border-indigo-900 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-indigo-900 mb-2">{year}年 九宮飛星風水佈局報告</h1>
              <div className="text-gray-500 text-sm">此報告由自動化風水助手生成，僅供民俗文化參考。</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-bold text-yellow-600">
                坐{mountainInfo.sitting}向{mountainInfo.name}
              </div>
              <div className="text-sm text-gray-400">羅盤度數: {Math.round(heading)}°</div>
            </div>
          </div>

          {/* New Grid Section: Match App Proportion */}
          <div className="flex justify-center mb-10 pdf-item">
             {/* Wrapper to handle rotation space if needed, though width is ample */}
             <div className="relative w-[550px] h-[550px] flex items-center justify-center">
                 <div 
                    className="grid grid-cols-3 gap-3 w-[500px] h-[500px] bg-indigo-50/30 p-3 rounded-2xl border border-indigo-100"
                    style={{ transform: `rotate(${rotation}deg)` }}
                 >
                    {layout.map((dirId) => {
                      const starNum = starMap[dirId];
                      const info = STAR_DATA[starNum];
                      const isCenter = dirId === 'C';
                      return (
                        <div 
                          key={dirId} 
                          className={`
                             relative flex flex-col items-center justify-center rounded-xl border-2 shadow-sm
                             ${isCenter ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100'}
                          `}
                          style={{ transform: `rotate(${-rotation}deg)` }}
                        >
                          {/* Top Left Direction Label (App Style) */}
                          <span className="absolute top-2 left-3 text-sm font-bold text-gray-400 tracking-widest uppercase">
                             {DIRECTION_NAMES[dirId]}
                          </span>

                          {/* Big Star Number: Strongly moved UP (-mt-10) and Pushed content DOWN (mb-10) */}
                          <span className={`text-6xl font-serif font-bold ${info.color} -mt-10 mb-10 leading-none block`}>
                             {starNum}
                          </span>

                          {/* Info Pills */}
                          <div className="flex flex-col items-center gap-1">
                             <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${info.auspicious ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {info.auspicious ? '吉' : '凶'}
                             </span>
                             <span className="text-[10px] text-gray-500 font-bold">
                                五行: {info.element === 'Wood' ? '木' : info.element === 'Fire' ? '火' : info.element === 'Earth' ? '土' : info.element === 'Metal' ? '金' : '水'}
                             </span>
                          </div>
                        </div>
                      )
                    })}
                 </div>
             </div>
          </div>

          {/* Content Body: 2 Columns */}
          <div className="flex gap-8 mb-8 items-start">
            
            {/* Left Col: Sidebar */}
            <div className="w-1/3 shrink-0 space-y-6">
               
               {/* 1. Tai Sui Card */}
               <div className="bg-red-50 p-5 rounded-xl border border-red-100 pdf-item">
                 <h3 className="text-center font-bold text-red-800 mb-4 border-b border-red-200 pb-2 text-lg">
                   犯太歲提醒 ({taiSuiInfo.yearSign}年)
                 </h3>
                 <div className="space-y-4">
                    {taiSuiInfo.conflicts.map((c, i) => (
                      <div key={i} className="flex gap-3 items-start">
                         <span className="bg-white border border-red-200 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                           {c.sign}
                         </span>
                         <div>
                            <span className="text-sm font-bold text-red-700 block mb-1">{c.type}</span>
                            <span className="text-xs text-gray-600 leading-tight block">{c.remedy}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>

               {/* 2. Instructions */}
               <div className="bg-gray-50 p-5 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100 pdf-item">
                 <h4 className="font-bold text-gray-800 mb-2">使用說明：</h4>
                 <p className="mb-4">
                   請站在房屋中央，使用羅盤確認方位。將右側的詳細建議應用於家中對應的房間或角落。
                 </p>
                 <h4 className="font-bold text-gray-800 mb-2">注意：</h4>
                 <p>
                   風水佈局應以人為本，保持環境整潔通風為首要。
                 </p>
               </div>
            </div>

            {/* Right Col: Detailed Breakdown */}
            <div className="w-2/3">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6 border-l-8 border-yellow-500 pl-4">全方位佈局建議</h3>
              <div className="space-y-8">
                {layout.map((dirId) => {
                  const starNum = starMap[dirId];
                  const star = STAR_DATA[starNum];
                  
                  // Added 'pdf-item' class to each star card
                  return (
                    <div key={dirId} className="border-b border-gray-200 pb-6 break-inside-avoid pdf-item">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="bg-indigo-900 text-white px-3 py-1.5 rounded-lg text-base font-bold w-16 text-center shadow-sm">
                          {DIRECTION_NAMES[dirId]}
                        </span>
                        <h4 className={`text-xl font-bold ${star.color} flex items-center gap-2`}>
                           {star.number} {star.name}
                        </h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${star.auspicious ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          {star.auspicious ? '吉星' : '凶星'} / 五行{star.element === 'Wood' ? '木' : star.element === 'Fire' ? '火' : star.element === 'Earth' ? '土' : star.element === 'Metal' ? '金' : '水'}
                        </span>
                      </div>
                      
                      <p className="text-base text-gray-700 mb-4 leading-relaxed">
                        {star.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50/60 p-4 rounded-xl border border-green-100">
                           <div className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1.5">
                             <span className="w-2 h-2 rounded-full bg-green-500"></span> 催旺/化解建議
                           </div>
                           <ul className="text-sm text-gray-700 space-y-2">
                             {star.recommendations.map((rec, i) => (
                               <li key={i} className="flex gap-2">
                                 <span className="text-green-600 font-bold">•</span>
                                 <span><span className="font-bold text-gray-900">{rec.item}</span>: {rec.reason}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                        <div className="bg-red-50/60 p-4 rounded-xl border border-red-100">
                           <div className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1.5">
                             <span className="w-2 h-2 rounded-full bg-red-500"></span> 避忌事項
                           </div>
                           <ul className="text-sm text-gray-700 space-y-2">
                             {star.taboos.map((t, i) => (
                               <li key={i} className="flex gap-2">
                                 <span className="text-red-500 font-bold">•</span>
                                 <span>{t}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-400 mt-12 border-t pt-6">
             © {year} 九宮飛星風水助手 | Generated Report
          </div>

        </div>
      </div>
    </>
  );
};