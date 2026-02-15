import { DirectionId, MountainInfo, TaiSuiInfo, ZodiacSign } from '../types';
import { MOUNTAINS } from '../constants';

/**
 * Calculates the center star number based on the year.
 * Formula: (11 - (Year % 9)) % 9. If 0, it becomes 9.
 */
export const calculateCenterStar = (year: number): number => {
  let star = (11 - (year % 9)) % 9;
  return star === 0 ? 9 : star;
};

/**
 * Generates the 3x3 grid of flying stars based on the center star.
 * Returns a map of DirectionId -> StarNumber.
 */
export const calculateFlyingStarGrid = (centerStar: number): Record<DirectionId, number> => {
  // Lo Shu Path:
  // 1. Center -> 2. NW -> 3. W -> 4. NE -> 5. S -> 6. N -> 7. SW -> 8. E -> 9. SE
  const path: DirectionId[] = ['C', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE'];
  const grid: Partial<Record<DirectionId, number>> = {};
  
  for (let i = 0; i < 9; i++) {
    const direction = path[i];
    let starNum = (centerStar + i);
    // Normalize to 1-9 range
    while (starNum > 9) starNum -= 9;
    while (starNum < 1) starNum += 9;
    grid[direction] = starNum;
  }
  return grid as Record<DirectionId, number>;
};

export const getGridLayout = (): DirectionId[] => {
  return [
    'SE', 'S', 'SW', 
    'E', 'C', 'W',   
    'NE', 'N', 'NW'  
  ];
};

/**
 * Gets the Mountain info (Sitting/Facing) for a given heading.
 */
export const getMountainInfo = (heading: number): MountainInfo => {
  // Normalize heading 0-360
  const normalized = (heading % 360 + 360) % 360;
  
  // Find the mountain where the angle falls within range
  // Special case: Zi (North) spans 352.5 to 7.5 (crossing 0)
  
  const found = MOUNTAINS.find(m => {
    if (m.start > m.end) {
      // Crossing 0 boundary (e.g. 352.5 to 7.5)
      return normalized >= m.start || normalized < m.end;
    }
    return normalized >= m.start && normalized < m.end;
  });

  return found || MOUNTAINS[1]; // Default to Zi/North if something fails
};

/**
 * Tai Sui Calculation
 */
const ZODIACS: ZodiacSign[] = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

export const calculateTaiSui = (year: number): TaiSuiInfo => {
  // 1900 was Year of Rat (index 0). Formula: (year - 1900) % 12
  // Actually simpler: (year - 4) % 12. 
  // 2020 (Rat): (2020-4)%12 = 2016%12 = 0. Correct.
  const offset = (year - 4) % 12;
  const yearIndex = offset < 0 ? offset + 12 : offset;
  const yearSign = ZODIACS[yearIndex];

  const conflicts = [];

  // 1. 值太歲 (Value): The sign itself
  conflicts.push({
    sign: yearSign,
    type: '值太歲' as const,
    description: '運程反覆，易生變化，情緒起伏大，宜靜不宜動。',
    remedy: '佩戴紅繩、化太歲錦囊，或本命佛飾品。'
  });

  // 2. 沖太歲 (Clash): Opposite sign (+6)
  const clashIndex = (yearIndex + 6) % 12;
  conflicts.push({
    sign: ZODIACS[clashIndex],
    type: '沖太歲' as const,
    description: '衝擊最大，多勞少得，易有轉職、搬遷或受傷之象。',
    remedy: '佩戴生肖三合/六合飾物 (如鼠沖馬，鼠戴牛/猴/龍)。'
  });

  // 3. 刑太歲 (Punish) / 破太歲 (Break) / 害太歲 (Harm)
  // Simplified logic for common conflicts.
  // Note: These rules can be complex. Using standard simplified table.

  // 害 (Harm): 
  // Rat(0)-Goat(7), Ox(1)-Horse(6), Tiger(2)-Snake(5), Rabbit(3)-Dragon(4), Monkey(8)-Pig(11), Rooster(9)-Dog(10)
  const harmMap: Record<number, number> = { 0:7, 1:6, 2:5, 3:4, 4:3, 5:2, 6:1, 7:0, 8:11, 9:10, 10:9, 11:8 };
  if (harmMap[yearIndex] !== undefined) {
      conflicts.push({
          sign: ZODIACS[harmMap[yearIndex]],
          type: '害太歲' as const,
          description: '易犯小人，人際關係受損，遭人陷害或誤解。',
          remedy: '佩戴紫水晶或黑曜石，遠離口舌。'
      });
  }

  // 刑 (Punish) & 破 (Break)
  // Logic varies greatly by year. Adding specific logic for common punishments.
  // Example: Rat(0) and Rabbit(3) are mutual Xing.
  // Ox(1), Dog(10), Goat(7) form Xing.
  
  // Custom check for specific years to cover basic "Fan Tai Sui" lists
  // This is a simplified reliable mapping for general purpose
  
  // Xing (Punish)
  const xingIndex = getXing(yearIndex);
  if (xingIndex !== null && xingIndex !== yearIndex && xingIndex !== clashIndex) { // Avoid duplicates if already listed
       conflicts.push({
          sign: ZODIACS[xingIndex],
          type: '刑太歲' as const,
          description: '是非較多，易有官非口舌，或肢體刑傷。',
          remedy: '佩戴貴人生肖飾品，多行善積德。'
      });
  }

  // Po (Break) - usually (Index + 3) % 12 or (Index - 3)
  const poIndex = (yearIndex + 3) % 12; // Simplified rule (Rabbit vs Horse is Po)
  // Note: Detailed Po rules: Rat-Rooster, Ox-Dragon, Tiger-Pig, Rabbit-Horse...
  // Let's use specific map for accuracy
  const poMap: Record<number, number> = { 0:9, 1:4, 2:11, 3:6, 4:1, 5:8, 6:3, 7:10, 8:5, 9:0, 10:7, 11:2 };
  
  const actualPoIndex = poMap[yearIndex];
  // Filter duplicates
  const alreadyAdded = conflicts.map(c => c.sign);
  if (!alreadyAdded.includes(ZODIACS[actualPoIndex])) {
      conflicts.push({
          sign: ZODIACS[actualPoIndex],
          type: '破太歲' as const,
          description: '運氣易有突然破壞，破財或人際關係破裂。',
          remedy: '佩戴白水晶或金屬飾品增強氣場。'
      });
  }

  return {
    yearSign,
    conflicts
  };
};

function getXing(yearIndex: number): number | null {
    // Rat(0) <-> Rabbit(3)
    if (yearIndex === 0) return 3;
    if (yearIndex === 3) return 0;
    
    // Ox(1), Dog(10), Goat(7)
    if (yearIndex === 1) return 10; // Ox punishes Dog (and Goat)
    if (yearIndex === 10) return 7; // Dog punishes Goat
    if (yearIndex === 7) return 1;  // Goat punishes Ox
    
    // Tiger(2), Snake(5), Monkey(8)
    if (yearIndex === 2) return 5;
    if (yearIndex === 5) return 8;
    if (yearIndex === 8) return 2;
    
    // Pig(11) self, Horse(6) self, Rooster(9) self, Dragon(4) self
    // These are usually handled under "Value Tai Sui" (Zhi), but strictly are Self-Punishment
    return null; 
}

/**
 * Calculates birth years for a specific zodiac sign relative to the current analysis year.
 * Returns a list of years going back approx 90 years.
 */
export const getAffectedBirthYears = (targetSign: ZodiacSign, currentYear: number): number[] => {
  const targetIndex = ZODIACS.indexOf(targetSign);

  // Find the most recent year of this sign equal to or before currentYear
  let yearIterator = currentYear;
  while (true) {
    const offset = (yearIterator - 4) % 12;
    const idx = offset < 0 ? offset + 12 : offset;
    if (idx === targetIndex) break;
    yearIterator--;
  }

  const years: number[] = [];
  // Go back ~90 years
  // yearIterator is the most recent instance (could be currentYear or up to 11 years ago)
  for (let y = yearIterator; y >= currentYear - 90; y -= 12) {
     years.push(y);
  }
  // Sort ascending for display
  return years.sort((a, b) => a - b);
}