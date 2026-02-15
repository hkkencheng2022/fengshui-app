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
請嚴格遵循朱鵲橋前輩的排盤與論命原則進行分析。

**朱派八字核心邏輯 - 格局判斷重點：**
八字格局判斷是論命最關鍵一步，請務必精確區分「真」與「假」的變格。

**一、正格 (Normal Structures)**
1. **正格身旺**：日主得令或得地，印比強，喜克洩耗 (財官傷)。
2. **正格身弱**：日主失令，財官食傷強，但日主有根氣或印星生扶，不能從。喜印比。

**二、專旺格 (Dominant Structures)**
1. **真專旺格**：日主極強，滿盤印比，**完全無**財官殺 (或被合化去)。喜印比食傷，忌財官。
2. **假專旺格**：氣勢趨於專旺，但局中藏有**微弱**的財官殺 (異黨) 作為「雜質/病」。
   - **特徵**：異黨無根無氣，無法抗衡旺勢。
   - **取用**：喜印比（生扶）、喜食傷（洩秀）。**忌財官（異黨）**。
   - **【重要邏輯修正】**：對於假專旺，那點微弱的異黨（如財星）就是「病」。
     - 藥是用來「去病」的（如火旺金弱，喜火剋金去病，或土洩火氣）。
     - **絕對禁止**：若財星為忌（病），解釋食傷（土）時，理由必須是「洩身/吐秀/化解比劫」，**絕不可**說是為了「生財/生金」。因為生扶忌神是嚴重的邏輯錯誤。

**三、從格 (Following Structures)**
1. **真從格 (True Follower)**
   - **特徵**：日主極弱，滿盤異黨 (財官食傷)。日主**完全無**印比生扶。
2. **假從格 (Fake Follower)**
   - **特徵**：日主極弱，但藏有**微弱**的印比 (自黨) 作為「雜質/病」。
   - **取用 (病藥論)**：
     - **病**：局中微弱的自黨 (印/比)。
     - **藥**：喜行運「去雜存純」 (如財星壞印)。
     - **忌**：大忌運助起自黨 (印比得根)，還原為「正格身弱」，則大凶。

**四、邏輯一致性檢查 (Logic Safety Check)**：
1. **忌神不可生**：若你判定某五行（如金）為忌神，在建議與運勢分析中，**不可**建議用其他五行（如土）去生扶它。
2. **食傷的作用**：
   - 在正格身旺：食傷是用來生財的（因為喜財）。
   - 在專旺格：食傷是用來「洩秀」的（因為忌財）。請務必區分清楚。

**分析步驟**：
1. **排四柱**：根據出生資料及真太陽時排出四柱。
2. **定格局**：判斷正格/變格（真/假）。
3. **取喜忌**：明確指出喜用神與仇忌神。針對「假格」，請特別指出「病」與「藥」。
4. **推流運**：針對用戶指定的年份進行流年分析，解釋該年干支對命局的影響（合/沖/生/剋）。

請務必回傳純 JSON 格式，不要包含 Markdown 代碼區塊或其他文字。
JSON 結構如下：
{
  "chart": {
    "yearPillar": "年柱",
    "monthPillar": "月柱",
    "dayPillar": "日柱",
    "hourPillar": "時柱"
  },
  "luckyElements": "【格局判斷】：(正格身旺/正格身弱/真專旺/假專旺/真從/假從)。\n【病藥分析(若為假格)】：病在[具體干支]，藥在[運勢/五行]，並說明去病原理。\n【喜用神】：...。【忌神】：...",
  "luckyDays": ["有利月份/日子的描述 (對應喜用)"],
  "cautionDays": ["需注意月份/日子的描述 (對應忌神)"],
  "layoutAdvice": "針對喜用五行的具體風水佈局建議。",
  "actionAdvice": "根據朱鵲橋命理邏輯給予的該年進取或守成建議。請特別注意：若流年助起忌神（如假專旺遇到財官），應建議保守；若流年去病（如食傷洩秀或比劫去財），則可進取。"
}
`;

const getUserPrompt = (date: string, time: string, gender: string, region: string, selectedYear: number) => {
  return `
    性別：${gender}
    出生日期：${date}
    出生時間：${time}
    出生地點：${region}
    流年預測年份：${selectedYear}
    
    請依照**朱鵲橋大師**的八字命理原則：
    1. 排出四柱。
    2. **精確判斷格局**，特別區分**真從/假從**與**真專/假專**。
    3. 指出喜用神與仇忌神。若為假格，請指出「去病」之運。
    4. **流年分析**：詳細分析 ${selectedYear} 年的流年干支與原局的作用（如：是否會合化？是否沖剋？）。
    5. **邏輯檢查**：若格局為專旺，忌神為財，解釋「食傷」時請強調其「洩秀」功能，切勿說「生財」。
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