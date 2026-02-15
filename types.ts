
export type ElementType = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
export type DirectionId = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'C';

export interface Recommendation {
  item: string;
  type: 'plant' | 'decor';
  reason: string;
}

export interface StarInfo {
  number: number;
  name: string;
  element: ElementType;
  auspicious: boolean; // 吉凶
  color: string; // Tailwind color class
  description: string;
  recommendations: Recommendation[];
  taboos: string[];
}

export interface GridCell {
  directionId: DirectionId;
  directionName: string;
  starNumber: number;
  baseAngle: number; // 0 for N, 90 for E, etc.
}

export interface CompassState {
  heading: number;
  isManual: boolean;
}

export interface MountainInfo {
  name: string;      // e.g. '子'
  angle: number;     // Center angle, e.g. 0
  start: number;     // Start angle
  end: number;       // End angle
  direction: DirectionId;
  sitting: string;   // Opposite mountain name
}

// Tai Sui Related Types
export type ZodiacSign = '鼠' | '牛' | '虎' | '兔' | '龍' | '蛇' | '馬' | '羊' | '猴' | '雞' | '狗' | '豬';
export type TaiSuiType = '值太歲' | '沖太歲' | '刑太歲' | '破太歲' | '害太歲';

export interface TaiSuiInfo {
  yearSign: ZodiacSign; // The sign of the year (Grand Duke)
  conflicts: {
    sign: ZodiacSign;
    type: TaiSuiType;
    description: string;
    remedy: string; // Suggested item/action
  }[];
}

export interface SavedRecord {
  id: string;
  year: number;
  heading: number;
  name: string;      // Facing name (e.g. 子)
  sitting: string;   // Sitting name (e.g. 午)
  timestamp: number;
}

// BaZi Types
export interface BaZiChart {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

export interface BaZiAnalysisResult {
  chart: BaZiChart;
  luckyElements: string; // 喜用神建議
  luckyDays: string[];   // 有利日子/月份
  cautionDays: string[]; // 需注意日子/月份
  layoutAdvice: string;  // 五行佈局建議
  actionAdvice: string;  // 進取建議
}

export interface SavedBaZiCase {
  id: string;
  name: string; // User defined name for the case
  date: string;
  time: string;
  gender: string;
  region: string;
  timestamp: number;
  predictionYear?: number;      // Saved prediction context
  result?: BaZiAnalysisResult;  // Saved analysis result
}

export type AIModel = 'deepseek' | 'gemini';
