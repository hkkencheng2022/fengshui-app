import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2, FileText } from 'lucide-react';
import { StarInfo, DirectionId } from '../types';
import { calculateCenterStar, calculateFlyingStarGrid, getGridLayout, getMountainInfo, calculateTaiSui } from '../utils/fengshui';
import { STAR_DATA, DIRECTION_NAMES, MOUNTAINS } from '../constants';

interface PDFGeneratorProps {
  gridRef: React.RefObject<HTMLDivElement>; // Kept for interface compatibility, though we render our own internal report now
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
      // 1. Capture the hidden report element
      // We temporarily make it visible to the "camera" (html2canvas) but keeps it hidden from user flow via absolute positioning
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // For cross-origin images (like the placeholder photos)
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

      // Add subsequent pages if the report is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // top padding for next page
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
        This is rendered off-screen but used by html2canvas to generate the PDF image.
        We force a fixed width (794px ~ A4 width at 96dpi) to ensure consistent formatting.
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

          {/* Report Body: 2 Columns */}
          <div className="flex gap-8 mb-8">
            
            {/* Left Col: The Grid Visualization */}
            <div className="w-1/3 shrink-0">
               <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                 <h3 className="text-center font-bold text-indigo-900 mb-4 border-b border-indigo-200 pb-2">
                   本年飛星圖 {alignCompass ? '(已對齊方位)' : ''}
                 </h3>
                 <div 
                    className="grid grid-cols-3 gap-2 aspect-square"
                    style={{ transform: `rotate(${rotation}deg)` }}
                 >
                    {layout.map((dirId) => {
                      const starNum = starMap[dirId];
                      const info = STAR_DATA[starNum];
                      const isCenter = dirId === 'C';
                      return (
                        <div 
                          key={dirId} 
                          className={`flex flex-col items-center justify-center rounded border p-2 ${isCenter ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}
                          style={{ transform: `rotate(${-rotation}deg)` }}
                        >
                          <span className="text-xs text-gray-400 mb-1">{DIRECTION_NAMES[dirId]}</span>
                          <span className={`text-3xl font-bold ${info.color}`}>{starNum}</span>
                          <span className={`text-[10px] px-1 rounded ${info.auspicious ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {info.auspicious ? '吉' : '凶'}
                          </span>
                        </div>
                      )
                    })}
                 </div>
               </div>
               
               {/* Tai Sui Section in Sidebar */}
               <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                 <h3 className="text-center font-bold text-red-800 mb-3 border-b border-red-200 pb-2">
                   犯太歲提醒 ({taiSuiInfo.yearSign}年)
                 </h3>
                 <div className="space-y-3">
                    {taiSuiInfo.conflicts.map((c, i) => (
                      <div key={i} className="flex gap-2 items-start">
                         <span className="bg-white border border-red-200 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                           {c.sign}
                         </span>
                         <div>
                            <span className="text-xs font-bold text-red-700 block">{c.type}</span>
                            <span className="text-[10px] text-gray-600">{c.remedy}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 leading-relaxed border border-gray-100">
                 <strong>使用說明：</strong><br/>
                 請站在房屋中央，使用羅盤確認方位。將報告中的建議應用於對應的房間或角落。
                 <br/><br/>
                 <strong>注意：</strong><br/>
                 風水佈局應以人為本，保持環境整潔通風為首要。
               </div>
            </div>

            {/* Right Col: Detailed Breakdown */}
            <div className="w-2/3">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 border-l-4 border-yellow-500 pl-3">全方位佈局建議</h3>
              <div className="space-y-6">
                {layout.map((dirId) => {
                  const starNum = starMap[dirId];
                  const star = STAR_DATA[starNum];
                  
                  return (
                    <div key={dirId} className="border-b border-gray-200 pb-5 break-inside-avoid">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-indigo-900 text-white px-2 py-1 rounded text-sm font-bold w-12 text-center">
                          {DIRECTION_NAMES[dirId]}
                        </span>
                        <h4 className={`text-lg font-bold ${star.color}`}>
                           {star.number} {star.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${star.auspicious ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          {star.auspicious ? '吉星' : '凶星'} / 五行{star.element === 'Wood' ? '木' : star.element === 'Fire' ? '火' : star.element === 'Earth' ? '土' : star.element === 'Metal' ? '金' : '水'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {star.description}
                      </p>

                      <div className="flex gap-4">
                        <div className="flex-1 bg-green-50/50 p-3 rounded-lg border border-green-100">
                           <div className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1">
                             <span className="text-green-600">●</span> 催旺/化解建議
                           </div>
                           <ul className="text-xs text-gray-700 space-y-1">
                             {star.recommendations.map((rec, i) => (
                               <li key={i}>• {rec.item}: {rec.reason}</li>
                             ))}
                           </ul>
                        </div>
                        <div className="flex-1 bg-red-50/50 p-3 rounded-lg border border-red-100">
                           <div className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                             <span className="text-red-500">●</span> 避忌事項
                           </div>
                           <ul className="text-xs text-gray-700 space-y-1">
                             {star.taboos.map((t, i) => (
                               <li key={i}>• {t}</li>
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
          
          <div className="text-center text-xs text-gray-400 mt-8 border-t pt-4">
             © {year} 九宮飛星風水助手 | Generated Report
          </div>

        </div>
      </div>
    </>
  );
};
