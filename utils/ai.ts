import { GoogleGenAI, Type } from "@google/genai";
import { BaZiAnalysisResult } from "../types";

// Helper to get Env Key safely (supports Vite's import.meta.env and standard process.env)
const getEnvKey = (key: string) => {
  // Try Vite standard (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  // Try Node/Webpack standard (process.env)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  
  return "";
};

// Helper to construct the system prompt
const getSystemPrompt = () => `
你是一位精通「朱鵲橋大師（Master Chu Cheuk Kiu）」命理學派的八字專家。
請嚴格遵循以下「六大格局系統定斷法則」進行分析，切勿混淆坊間其他派別。

**一、格局定斷法則 (Structure Determination)**
格局判定首重「月令」，次看全局氣勢。

1. **正格 (Normal Structures)**
   - **身旺**：
     - *條件*：得令（月令旺相）、得地（地支有強根）、得生（印星）、得助（比劫）。上述四者佔其二以上，或幫扶力量佔全局50%-80%。
     - *取用*：喜剋洩耗（財、官、食傷）。
   - **身弱**：
     - *條件*：失令、失地、無助佔其二以上。日主雖弱但有根氣或印星生扶，不能從。
     - *取用*：喜印比（生扶）。

2. **專旺格 (Dominant Structures)**
   - *條件*：日主極旺，月令當令且得時。全局干支以自黨（比劫、印星）為主，形成三合/三會局更佳。
   - **真專旺**：全局完全無財官殺（異黨）。
   - **假專旺**：日主雖旺，但局中藏有1-2個**氣絕無根**的異黨（如微弱財星或官星）作為「雜質/病」。
   - *取用*：喜印比（生扶）、喜食傷（洩秀）。**忌財官（異黨）**。
   - **【假專之病藥邏輯】**：假專旺格中，那點微弱的異黨（如財星）就是「病」。
     - 藥是用來「去病」的（如火專旺見金為病，喜火剋金去病）。
     - **絕對禁止**：解釋食傷時，理由必須是「洩身/吐秀」，**絕不可**說是為了「生財」。因為在專旺格中，財是忌神（病），不能去生它。

3. **從格 (Follower Structures)**
   - *條件*：日主極弱，無根無助，全局氣勢純粹偏向異黨。
   - **真從格**：全局完全無印比（自黨）。
   - **假從格**：日主雖極弱，但局中藏有1-2個**微弱/被合化/無根**的自黨（印/比）作為「雜質/病」。
   - *取用*：順從旺勢。
   - **【假從之病藥邏輯】**：假從格中，微弱的自黨（印比）是「病」。
     - 藥是「去雜存純」之運（如財星壞印）。
     - **大忌**：行運助起自黨（印比得根），還原為「正格身弱」，則大凶。

**二、分析要求**
1. **排四柱**：根據出生資料及真太陽時排出四柱。
2. **定格局**：判斷正格/變格（真/假）。若為假格，請明確指出「病」在哪裡。
3. **取喜忌**：明確指出喜用神與仇忌神。
4. **推流運**：針對用戶指定的年份，分析流年干支與原局的作用（合/沖/生/剋）。
5. **實務建議**：
   - 若流年助起忌神（如假專旺遇到財官，或假從格遇到印比），應建議「保守/防守」。
   - 若流年去病（如食傷洩秀或比劫去財），則建議「進取」。

請務必回傳純 JSON 格式，不要包含 Markdown 代碼區塊或其他文字。
JSON 結構如下：
{
  "chart": {
    "yearPillar": "年柱",
    "monthPillar": "月柱",
    "dayPillar": "日柱",
    "hourPillar": "時柱"
  },
  "luckyElements": "【格局】：(正格身旺/身弱、真/假專旺、真/假從)。\n【分析】：簡述得令得地情況。若為假格，說明病藥。\n【喜用】：...。【忌神】：...",
  "luckyDays": ["有利月份/日子的描述 (對應喜用)"],
  "cautionDays": ["需注意月份/日子的描述 (對應忌神)"],
  "layoutAdvice": "針對喜用五行的具體風水佈局建議。",
  "actionAdvice": "根據流年對格局的影響（助吉或助凶），給予進取或守成建議。"
}
`;

const getUserPrompt = (date: string, time: string, gender: string, region: string, selectedYear: number) => {
  return `
    性別：${gender}
    出生日期：${date}
    出生時間：${time}
    出生地點：${region}
    流年預測年份：${selectedYear}
    
    請依照上述「朱鵲橋大師」的系統法則進行分析。
    重點檢查：
    1. 日主是否有根？（決定是正格身弱還是從格）
    2. 是否有破格之物但氣絕？（決定是真格還是假格）
    3. 若為假格，請在「格局」欄位說明病藥原理。
  `;
};

// DeepSeek API Handler
export const callDeepSeek = async (
  apiKey: string,
  date: string,
  time: string,
  gender: string,
  region: string,
  selectedYear: number
): Promise<BaZiAnalysisResult> => {
  // Check for Env Var (VITE_DEEPSEEK_API_KEY or DEEPSEEK_API_KEY) if user input is empty
  const envKey = getEnvKey('VITE_DEEPSEEK_API_KEY') || getEnvKey('DEEPSEEK_API_KEY');
  const finalKey = apiKey || envKey;
  
  if (!finalKey) throw new Error("請設定 DeepSeek API Key (可於環境變數設定 VITE_DEEPSEEK_API_KEY)");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${finalKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: getUserPrompt(date, time, gender, region, selectedYear) }
      ],
      stream: false,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "DeepSeek API 呼叫失敗");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
};

// Gemini API Handler
export const callGemini = async (
  date: string,
  time: string,
  gender: string,
  region: string,
  selectedYear: number
): Promise<BaZiAnalysisResult> => {
  // Initialize with env key (supports VITE_API_KEY or API_KEY)
  const envKey = getEnvKey('VITE_API_KEY') || getEnvKey('API_KEY') || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: envKey || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: getUserPrompt(date, time, gender, region, selectedYear),
    config: {
      systemInstruction: getSystemPrompt(),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chart: {
            type: Type.OBJECT,
            properties: {
              yearPillar: { type: Type.STRING },
              monthPillar: { type: Type.STRING },
              dayPillar: { type: Type.STRING },
              hourPillar: { type: Type.STRING },
            }
          },
          luckyElements: { type: Type.STRING },
          luckyDays: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          cautionDays: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          layoutAdvice: { type: Type.STRING },
          actionAdvice: { type: Type.STRING },
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Gemini 無法產生回應");
  
  return JSON.parse(text) as BaZiAnalysisResult;
};