import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Compass } from './components/Compass';
import { Grid } from './components/Grid';
import { StarModal } from './components/StarModal';
import { PDFGenerator } from './components/PDFGenerator';
import { TaiSuiCard } from './components/TaiSuiCard';
import { BaZiAnalysis } from './components/BaZiAnalysis'; // Import new component
import { CompassState, DirectionId, SavedRecord } from './types';
import { STAR_DATA } from './constants';
import { getMountainInfo } from './utils/fengshui';
import { ChevronLeft, ChevronRight, Map, Save, Trash2, History, RotateCcw, Compass as CompassIcon, Sparkles } from 'lucide-react';

// Interface to support iOS specific property
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fengshui' | 'bazi'>('fengshui');
  const [year, setYear] = useState(new Date().getFullYear());
  const [compass, setCompass] = useState<CompassState>({ heading: 180, isManual: true });
  const [selectedCell, setSelectedCell] = useState<{ star: number, dir: DirectionId } | null>(null);
  const [alignCompass, setAlignCompass] = useState(false);
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Load records from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fengshui_records');
    if (saved) {
      try {
        setSavedRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved records');
      }
    }
  }, []);

  // Save records to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('fengshui_records', JSON.stringify(savedRecords));
  }, [savedRecords]);

  // Compass Logic
  const handleHeadingChange = (heading: number) => {
    setCompass(prev => ({ ...prev, heading }));
  };

  // Define handler with useCallback to ensure stable reference for add/removeEventListener
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    const iosEvent = event as DeviceOrientationEventiOS;
    if (iosEvent.webkitCompassHeading) {
      // iOS
      setCompass(prev => ({ ...prev, heading: iosEvent.webkitCompassHeading || 0 }));
    } else if (event.alpha) {
      // Android
      setCompass(prev => ({ ...prev, heading: 360 - (event.alpha || 0) }));
    }
  }, []);

  const toggleCompassMode = () => {
    setCompass(prev => {
        // If switching TO manual, stop listening
        if (!prev.isManual) {
             window.removeEventListener('deviceorientation', handleDeviceOrientation);
        }
        return { ...prev, isManual: !prev.isManual };
    });
  };

  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setCompass(prev => ({ ...prev, isManual: false }));
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        } else {
          alert('需要指南針權限才能自動測量');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Non-iOS 13+ devices
      setCompass(prev => ({ ...prev, isManual: false }));
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  };

  // Record Management
  const handleSaveRecord = () => {
    const mountainInfo = getMountainInfo(compass.heading);
    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      year: year,
      heading: compass.heading,
      name: mountainInfo.name,
      sitting: mountainInfo.sitting,
      timestamp: Date.now()
    };

    setSavedRecords(prev => {
      // Add to top, keep max 3
      const updated = [newRecord, ...prev].slice(0, 3);
      return updated;
    });
    alert(`已儲存：坐${mountainInfo.sitting}向${mountainInfo.name}`);
  };

  const handleDeleteRecord = (id: string) => {
    setSavedRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleLoadRecord = (record: SavedRecord) => {
    setYear(record.year);
    setCompass({ heading: record.heading, isManual: true }); // Switch to manual to hold the angle
    // Stop listening to sensors if we were in auto mode
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [handleDeviceOrientation]);

  return (
    <div className="min-h-screen pb-24 bg-gray-50/50">
      {/* Header - Z-Index 50 to cover Compass Red Line */}
      <header className="bg-indigo-900 text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wide text-yellow-400">
              {activeTab === 'fengshui' ? '九宮飛星' : '八字命理'}
            </h1>
            <p className="text-indigo-200 text-xs">專業風水運勢助手</p>
          </div>
          {activeTab === 'fengshui' && (
            <PDFGenerator 
              gridRef={gridRef} 
              year={year} 
              heading={compass.heading} 
              alignCompass={alignCompass}
            />
          )}
          {activeTab === 'bazi' && (
             <div className="bg-indigo-800 px-3 py-1 rounded-lg text-sm font-serif border border-indigo-700">
               預測年份: <span className="text-yellow-400 font-bold">{year}</span>
             </div>
          )}
        </div>
      </header>

      {/* Main Content - Increased padding top to pt-10 */}
      <main className="max-w-md mx-auto px-4 pt-10 space-y-6">
        
        {activeTab === 'fengshui' ? (
          <>
            {/* Year Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <button 
                onClick={() => setYear(y => Math.max(1900, y - 1))}
                className="p-2 hover:bg-gray-100 rounded-full text-indigo-600 transition"
              >
                <ChevronLeft />
              </button>
              <div className="text-center">
                <span className="text-sm text-gray-500 block">西元</span>
                <span className="text-2xl font-bold text-indigo-900 font-serif">{year} 年</span>
              </div>
              <button 
                onClick={() => setYear(y => Math.min(2100, y + 1))}
                className="p-2 hover:bg-gray-100 rounded-full text-indigo-600 transition"
              >
                <ChevronRight />
              </button>
            </div>

            {/* Compass Section */}
            <Compass 
              heading={compass.heading}
              isManual={compass.isManual}
              onHeadingChange={handleHeadingChange}
              onToggleMode={toggleCompassMode}
              onRequestPermission={requestCompassPermission}
            />

            {/* Save & Grid Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-lg font-bold text-indigo-900">風水佈局</h2>
                <div className="flex gap-2">
                    <button
                      onClick={handleSaveRecord}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      儲存結果
                    </button>
                    <button 
                        onClick={() => setAlignCompass(!alignCompass)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                            alignCompass 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-gray-600 border-gray-300'
                        }`}
                    >
                        <Map className="w-3 h-3" />
                        {alignCompass ? '已對齊' : '對齊羅盤'}
                    </button>
                </div>
              </div>
            </div>

            {/* The Grid */}
            <Grid 
              gridRef={gridRef}
              year={year} 
              heading={compass.heading}
              alignCompass={alignCompass}
              onCellClick={(star, dir) => setSelectedCell({ star, dir })}
            />

            {/* Saved Records Section */}
            {savedRecords.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                  <History className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">已存紀錄 ({savedRecords.length}/3)</h3>
                </div>
                <div className="space-y-2">
                  {savedRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                      <div onClick={() => handleLoadRecord(record)} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-indigo-900">
                                {record.year}年 坐{record.sitting}向{record.name}
                            </span>
                            <span className="text-[10px] bg-white border border-gray-200 px-1.5 rounded text-gray-500">
                                {Math.round(record.heading)}°
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(record.timestamp).toLocaleString()}
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleLoadRecord(record)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition"
                            title="載入設定"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tai Sui Card */}
            <TaiSuiCard year={year} />
          </>
        ) : (
          <BaZiAnalysis selectedYear={year} />
        )}

      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe z-30">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab('fengshui')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition ${activeTab === 'fengshui' ? 'text-indigo-900 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <CompassIcon className="w-6 h-6" />
            <span className="text-xs font-bold">羅盤佈局</span>
          </button>
          <button
            onClick={() => setActiveTab('bazi')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition ${activeTab === 'bazi' ? 'text-indigo-900 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-xs font-bold">八字運勢</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedCell && (
        <StarModal 
          star={STAR_DATA[selectedCell.star]}
          direction={selectedCell.dir}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};

export default App;