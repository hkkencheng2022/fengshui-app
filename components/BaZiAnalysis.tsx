import React, { useState, useEffect } from 'react';
import { callDeepSeek, callGemini } from '../utils/ai';
import { BaZiAnalysisResult, AIModel, SavedBaZiCase } from '../types';
import { BrainCircuit, Sparkles, AlertTriangle, ArrowRight, Settings, Loader2, MapPin, CalendarClock, Save, Trash2, FolderOpen, History, FileText, CheckCircle2 } from 'lucide-react';

const PRESET_REGIONS = [
  '香港', '澳門', '台北', '台中', '高雄', 
  '北京', '上海', '廣州', '深圳', '成都',
  '新加坡', '吉隆坡', '東京', '大阪',
  '紐約', '舊金山', '溫哥華', '多倫多',
  '倫敦', '雪梨', '墨爾本'
];

interface BaZiAnalysisProps {
  selectedYear: number;
}

export const BaZiAnalysis: React.FC<BaZiAnalysisProps> = ({ selectedYear }) => {
  // Input States
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthRegion, setBirthRegion] = useState('香港');
  const [gender, setGender] = useState('男');
  const [caseName, setCaseName] = useState(''); // Name for saving
  
  // Settings & Prediction
  const [predictionYear, setPredictionYear] = useState(selectedYear);
  const [model, setModel] = useState<AIModel>('deepseek');
  const [apiKey, setApiKey] = useState('');
  const [hasEnvDeepSeekKey, setHasEnvDeepSeekKey] = useState(false);
  
  // App States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaZiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [savedCases, setSavedCases] = useState<SavedBaZiCase[]>([]);

  // Sync prediction year with prop if prop changes
  useEffect(() => {
    setPredictionYear(selectedYear);
  }, [selectedYear]);

  // Load API Key & Cases from local storage and Environment
  useEffect(() => {
    // Check for Environment Variable for DeepSeek (Vite standard or Process)
    // We check VITE_DEEPSEEK_API_KEY first as that is best practice for Netlify
    let envKey = '';
    
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEEPSEEK_API_KEY) {
       // @ts-ignore
       envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    } else if (process.env.DEEPSEEK_API_KEY) {
       envKey = process.env.DEEPSEEK_API_KEY;
    } else if (process.env.VITE_DEEPSEEK_API_KEY) {
       envKey = process.env.VITE_DEEPSEEK_API_KEY;
    }

    if (envKey) {
      setHasEnvDeepSeekKey(true);
      setApiKey(envKey);
    } else {
      const savedKey = localStorage.getItem('deepseek_key');
      if (savedKey) setApiKey(savedKey);
    }

    const savedRecords = localStorage.getItem('bazi_records');
    if (savedRecords) {
        try {
            setSavedCases(JSON.parse(savedRecords));
        } catch(e) {
            console.error("Failed to parse saved bazi cases");
        }
    }
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('deepseek_key', val);
  };

  // Case Management
  const handleSaveCase = () => {
      if (!birthDate) return alert("請先輸入出生日期");
      const name = caseName || `${birthDate} 命盤`;
      
      const newCase: SavedBaZiCase = {
          id: Date.now().toString(),
          name,
          date: birthDate,
          time: birthTime,
          gender,
          region: birthRegion,
          timestamp: Date.now(),
          // Save result context if available
          predictionYear: result ? predictionYear : undefined,
          result: result || undefined
      };

      const updated = [newCase, ...savedCases];
      setSavedCases(updated);
      localStorage.setItem('bazi_records', JSON.stringify(updated));
      alert(`已儲存：${name}` + (result ? ` (含 ${predictionYear} 運勢)` : ''));
      setCaseName(''); // Reset name input
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Stop click from bubbling to the parent row which loads the case
      if(!window.confirm("確定刪除此紀錄？")) return;
      const updated = savedCases.filter(c => c.id !== id);
      setSavedCases(updated);
      localStorage.setItem('bazi_records', JSON.stringify(updated));
  };

  const handleLoadCase = (c: SavedBaZiCase) => {
      setBirthDate(c.date);
      setBirthTime(c.time);
      setGender(c.gender);
      setBirthRegion(c.region);
      setCaseName(c.name);
      
      // Load saved result if exists, otherwise clear result to avoid confusion
      if (c.result && c.predictionYear) {
        setPredictionYear(c.predictionYear);
        setResult(c.result);
      } else {
        setResult(null);
        // We keep the current predictionYear (which is synced with compass/selectedYear) 
        // because the user probably wants to check this case for the currently selected year.
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!birthDate) {
      setError("請選擇出生日期");
      return;
    }
    if (!birthRegion) {
      setError("請輸入出生地點");
      return;
    }
    
    // Check key requirements
    // If using deepseek and NO env key and NO user key
    if (model === 'deepseek' && !hasEnvDeepSeekKey && !apiKey) {
      setError("請輸入 DeepSeek API Key");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data: BaZiAnalysisResult;
      // Pass predictionYear instead of selectedYear
      if (model === 'deepseek') {
        data = await callDeepSeek(apiKey, birthDate, birthTime, gender, birthRegion, predictionYear);
      } else {
        data = await callGemini(birthDate, birthTime, gender, birthRegion, predictionYear);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "分析失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            八字運勢分析
          </h2>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Prediction Year Selector (Override) */}
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
              流年預測年份
           </div>
           <div className="flex items-center gap-2">
              <input 
                type="number"
                value={predictionYear}
                onChange={(e) => setPredictionYear(Number(e.target.value))}
                className="w-20 p-1 text-center font-bold text-indigo-900 bg-white border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-xs text-indigo-400">年</span>
           </div>
        </div>

        {/* Settings Area */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl animate-fade-in">
            <label className="block text-sm font-bold text-gray-700 mb-2">AI 模型選擇</label>
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setModel('deepseek')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${model === 'deepseek' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
              >
                DeepSeek
              </button>
              <button 
                onClick={() => setModel('gemini')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${model === 'gemini' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
              >
                Gemini Pro
              </button>
            </div>
            
            {model === 'deepseek' && (
              <div>
                {hasEnvDeepSeekKey ? (
                   <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs font-bold text-green-800">已透過環境變數設定 (Secure)</p>
                        <p className="text-[10px] text-green-600">系統已讀取 VITE_DEEPSEEK_API_KEY</p>
                      </div>
                   </div>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DeepSeek API Key</label>
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => handleSaveKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                       建議於 Netlify 設定環境變數 <code>VITE_DEEPSEEK_API_KEY</code> 以確保安全。
                    </p>
                  </>
                )}
              </div>
            )}
            
            {model === 'gemini' && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Settings className="w-3 h-3" /> 使用系統內建 API Key
              </p>
            )}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-4">
            {/* Case Name Input (Optional) */}
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">命主姓名/備註 (用於儲存)</label>
               <input 
                 type="text" 
                 value={caseName}
                 onChange={(e) => setCaseName(e.target.value)}
                 placeholder="例如：陳大文 (非必填)"
                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">出生日期</label>
                <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">出生時間</label>
                <input 
                type="time" 
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">出生地點 (用於真太陽時校正)</label>
                <div className="relative">
                    <input 
                    type="text" 
                    list="region-options"
                    value={birthRegion}
                    onChange={(e) => setBirthRegion(e.target.value)}
                    placeholder="請輸入或選擇城市"
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <datalist id="region-options">
                        {PRESET_REGIONS.map(city => (
                            <option key={city} value={city} />
                        ))}
                    </datalist>
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="男" checked={gender === '男'} onChange={(e) => setGender(e.target.value)} className="accent-indigo-600" />
                        <span className="text-sm font-medium">男</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="女" checked={gender === '女'} onChange={(e) => setGender(e.target.value)} className="accent-indigo-600" />
                        <span className="text-sm font-medium">女</span>
                    </label>
                </div>
                
                {/* Save Button */}
                <button 
                    onClick={handleSaveCase}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition"
                >
                    <Save className="w-3.5 h-3.5" />
                    {result ? '儲存分析結果' : '儲存命盤'}
                </button>
            </div>
        </div>

        <div className="mt-6">
            <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-wait' : 'bg-indigo-900 hover:bg-indigo-800 active:scale-[0.98]'}`}
            >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {loading ? '大師推算中...' : `開始 ${predictionYear} 運勢分析`}
            </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Saved Cases List */}
      {savedCases.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-fade-in">
           <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
             <History className="w-4 h-4 text-gray-500" />
             <h3 className="text-sm font-bold text-gray-700">已存命盤 ({savedCases.length})</h3>
           </div>
           <div className="space-y-2 max-h-60 overflow-y-auto">
             {savedCases.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-indigo-50 transition" onClick={() => handleLoadCase(c)}>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-900 text-sm">{c.name}</span>
                            {c.result && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded border border-green-200">
                                   <FileText className="w-2.5 h-2.5" />
                                   含{c.predictionYear}運勢
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {c.date} ({c.gender}) {c.time} @ {c.region}
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleLoadCase(c); }}
                           className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition"
                           title="載入"
                         >
                           <FolderOpen className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={(e) => handleDeleteCase(c.id, e)}
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

      {/* Results */}
      {result && (
        <div className="animate-slide-up space-y-6">
          
          {/* 1. The Chart (4 Pillars) */}
          <div className="bg-[#8B0000] rounded-2xl p-6 text-yellow-100 shadow-xl border-4 border-[#5c0000] relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
             <h3 className="text-center font-serif text-lg font-bold mb-6 tracking-[0.2em] border-b border-yellow-500/30 pb-2 relative z-10">
               八字命盤
             </h3>
             <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                {['時柱', '日柱', '月柱', '年柱'].map((title, i) => {
                  const val = [result.chart.hourPillar, result.chart.dayPillar, result.chart.monthPillar, result.chart.yearPillar][i];
                  return (
                    <div key={i} className="flex flex-col items-center">
                       <span className="text-xs text-yellow-400/80 mb-2">{title}</span>
                       <div className="w-12 py-4 bg-red-50 text-red-900 font-serif font-bold text-xl rounded shadow-inner writing-vertical-lr flex justify-center items-center h-32 border border-red-200">
                         {val}
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* 2. Analysis Sections */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
             <div className="mb-6">
               <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                 <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                 格局與喜忌
               </h4>
               <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-xl border border-indigo-100 whitespace-pre-wrap">
                 {result.luckyElements}
               </p>
             </div>

             <div className="grid gap-4 sm:grid-cols-2 mb-6">
               <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <h5 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> {predictionYear}年 有利/進取時機
                  </h5>
                  <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                    {result.luckyDays.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
               </div>
               <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <h5 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {predictionYear}年 需注意/保守時機
                  </h5>
                  <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                    {result.cautionDays.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
               </div>
             </div>

             <div className="mb-6">
               <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                 <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                 五行佈局建議
               </h4>
               <div className="text-sm text-gray-700 leading-relaxed border-l-4 border-indigo-200 pl-4 py-1">
                 {result.layoutAdvice}
               </div>
             </div>

             <div>
               <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                 <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                 朱鵲橋大師進取建議 ({predictionYear})
               </h4>
               <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                 <ArrowRight className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                 <p className="text-sm text-gray-800 font-medium">
                   {result.actionAdvice}
                 </p>
               </div>
             </div>

          </div>
          
          <p className="text-center text-xs text-gray-400">
            * AI 分析僅供參考，命運掌握在自己手中。
          </p>

        </div>
      )}
    </div>
  );
};