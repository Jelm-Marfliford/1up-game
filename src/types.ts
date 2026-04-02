export interface UserStats {
  hp: number;
  maxHp: number;
  san: number;
  maxSan: number;
  exp: number;
  level: number;
  levelTitle: string;
  gold: number;
}

export interface Buff {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  description: string;
  duration?: number; // in minutes
  icon: string;
}

export type MoodColor = 'green' | 'yellow' | 'red';

export interface MoodPost {
  id: string;
  color: MoodColor;
  content: string;
  timestamp: number;
  location: { x: number; y: number }; // Percentage for simple map
}

export const LEVELS = [
  { minExp: 0, title: '脆皮萌新 (Crispy Newbie)' },
  { minExp: 100, title: '养生达人 (Wellness Pro)' },
  { minExp: 500, title: '长寿宗师 (Longevity Master)' },
];
