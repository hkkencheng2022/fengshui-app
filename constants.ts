import { StarInfo, DirectionId, MountainInfo } from './types';

export const STAR_DATA: Record<number, StarInfo> = {
  1: {
    number: 1,
    name: '一白貪狼星',
    element: 'Water',
    auspicious: true,
    color: 'text-blue-600',
    description: '主官運、文昌、人緣與桃花，利於學業與事業發展。',
    recommendations: [
      { item: '金屬工藝品', type: 'decor', reason: '金生水，增強吉星力量' },
      { item: '流水擺飾', type: 'decor', reason: '流動之水催旺財運' }
    ],
    taboos: ['避免堆放雜物', '不宜紅色過多（火水相沖）']
  },
  2: {
    number: 2,
    name: '二黑巨門星',
    element: 'Earth',
    auspicious: false,
    color: 'text-gray-600',
    description: '病符星，主疾病傷痛，需注意健康問題，尤其是腹部與消化系統。',
    recommendations: [
      { item: '銅葫蘆', type: 'decor', reason: '化解病氣，金洩土氣' },
      { item: '六帝錢', type: 'decor', reason: '鎮宅化煞' }
    ],
    taboos: ['紅色地毯', '點長明燈', '放置盆栽（木剋土激怒病符）']
  },
  3: {
    number: 3,
    name: '三碧祿存星',
    element: 'Wood',
    auspicious: false,
    color: 'text-green-700',
    description: '是非星，主口舌爭端、官非訴訟，易引起情緒波動。',
    recommendations: [
      { item: '紅色中國結', type: 'decor', reason: '火洩木氣，化解是非' },
      { item: '紫水晶', type: 'decor', reason: '平和心境，屬火象徵' }
    ],
    taboos: ['綠色植物', '藍色物品', '魚缸']
  },
  4: {
    number: 4,
    name: '四綠文曲星',
    element: 'Wood',
    auspicious: true,
    color: 'text-emerald-500',
    description: '文昌星，主學業、考試、進修及文職工作，亦利桃花。',
    recommendations: [
      { item: '富貴竹 (4支)', type: 'plant', reason: '步步高升，催旺文昌' },
      { item: '文昌塔', type: 'decor', reason: '集中精神，提升考運' }
    ],
    taboos: ['金屬銳器', '雜亂無章']
  },
  5: {
    number: 5,
    name: '五黃廉貞星',
    element: 'Earth',
    auspicious: false,
    color: 'text-yellow-600',
    description: '大煞星，主災禍、意外、重病，是九星中最凶的一顆。',
    recommendations: [
      { item: '銅鐘/銅鈴', type: 'decor', reason: '金屬聲音化解土煞' },
      { item: '安忍水', type: 'decor', reason: '強力化煞' }
    ],
    taboos: ['動土', '紅色物品', '興工裝修']
  },
  6: {
    number: 6,
    name: '六白武曲星',
    element: 'Metal',
    auspicious: true,
    color: 'text-gray-400',
    description: '偏財星，主橫財、貴人、權力，利於武職及管理階層。',
    recommendations: [
      { item: '黃水晶', type: 'decor', reason: '土生金，聚財' },
      { item: '聚寶盆', type: 'decor', reason: '招財納福' }
    ],
    taboos: ['紅色物品', '爐灶']
  },
  7: {
    number: 7,
    name: '七赤破軍星',
    element: 'Metal',
    auspicious: false,
    color: 'text-red-400',
    description: '破財星，主盜賊、火災、損丁，亦代表口舌是非。',
    recommendations: [
      { item: '黑曜石', type: 'decor', reason: '水洩金氣，化煞' },
      { item: '藍色地毯', type: 'decor', reason: '五行屬水，安撫肅殺之氣' }
    ],
    taboos: ['金屬尖銳物', '樂器']
  },
  8: {
    number: 8,
    name: '八白左輔星',
    element: 'Earth',
    auspicious: true,
    color: 'text-amber-500',
    description: '當運財星（九運中為退氣，但仍吉），主正財、置業、升職。',
    recommendations: [
      { item: '紅燈籠/紅地毯', type: 'decor', reason: '火生土，催旺財氣' },
      { item: '紫晶洞', type: 'decor', reason: '聚氣生財' }
    ],
    taboos: ['綠色植物（木剋土）', '垃圾桶']
  },
  9: {
    number: 9,
    name: '九紫右弼星',
    element: 'Fire',
    auspicious: true,
    color: 'text-purple-600',
    description: '喜慶星（九運當令），主喜事、姻緣、人緣，大吉之星。',
    recommendations: [
      { item: '紅色鮮花', type: 'plant', reason: '木火通明，喜上加喜' },
      { item: '常綠植物', type: 'plant', reason: '生旺火氣' }
    ],
    taboos: ['黑色物品', '水景（水剋火）']
  }
};

// Map Directions to Standard Angles (Degrees)
export const DIRECTION_ANGLES: Record<DirectionId, number> = {
  'N': 0,
  'NE': 45,
  'E': 90,
  'SE': 135,
  'S': 180,
  'SW': 225,
  'W': 270,
  'NW': 315,
  'C': 0 // Center technically has no angle, treat as neutral
};

export const DIRECTION_NAMES: Record<DirectionId, string> = {
  'N': '正北',
  'NE': '東北',
  'E': '正東',
  'SE': '東南',
  'S': '正南',
  'SW': '西南',
  'W': '正西',
  'NW': '西北',
  'C': '中宮'
};

// Bagua Trigrams Mapping
export const DIRECTION_TRIGRAMS: Record<DirectionId, string> = {
  'N': '坎',
  'NE': '艮',
  'E': '震',
  'SE': '巽',
  'S': '離',
  'SW': '坤',
  'W': '兌',
  'NW': '乾',
  'C': '中'
};

// 24 Mountains Data
// Note: Lo Pan 24 Mountains order (Clockwise from North)
// North: Ren (337.5-352.5), Zi (352.5-7.5), Gui (7.5-22.5)
const RAW_MOUNTAINS: [string, DirectionId, number][] = [
  ['壬', 'N', 345], ['子', 'N', 0], ['癸', 'N', 15],
  ['丑', 'NE', 30], ['艮', 'NE', 45], ['寅', 'NE', 60],
  ['甲', 'E', 75], ['卯', 'E', 90], ['乙', 'E', 105],
  ['辰', 'SE', 120], ['巽', 'SE', 135], ['巳', 'SE', 150],
  ['丙', 'S', 165], ['午', 'S', 180], ['丁', 'S', 195],
  ['未', 'SW', 210], ['坤', 'SW', 225], ['申', 'SW', 240],
  ['庚', 'W', 255], ['酉', 'W', 270], ['辛', 'W', 285],
  ['戌', 'NW', 300], ['乾', 'NW', 315], ['亥', 'NW', 330]
];

export const MOUNTAINS: MountainInfo[] = RAW_MOUNTAINS.map(([name, dir, angle], index) => {
  // Calculate start/end handling the 360 wrap
  let start = angle - 7.5;
  let end = angle + 7.5;
  if (start < 0) start += 360;
  // Opposite mountain (Sitting) is +12 indices away in a 24-item circle
  const oppositeIndex = (index + 12) % 24;
  const sitting = RAW_MOUNTAINS[oppositeIndex][0];

  return {
    name: name as string,
    angle: angle as number,
    start,
    end,
    direction: dir as DirectionId,
    sitting: sitting as string,
    trigram: DIRECTION_TRIGRAMS[dir as DirectionId] // Add Trigram data
  };
});