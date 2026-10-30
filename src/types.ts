export type CosmicThemeId =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gold'
  | 'orange'
  | 'aqua'
  | 'pearl';

export interface CosmicThemeConfig {
  id: CosmicThemeId;
  name: string;
  heartEmoji: string;
  primary: string;
  secondary: string;
  stardust: string[];
  glow: string;
  glowSubtle: string;
  secondaryGlow: string;
  border: string;
  btnBg: string;
  btnHoverBg: string;
  bgCenter: string;
  bgCenterDeep: string;
  bgMist: string;
  bgMistSubtle: string;
  btnGradient: string;
  btnShadow: string;
  btnShadowHover: string;
}

export const COSMIC_THEMES: Record<CosmicThemeId, CosmicThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Celestial Blue',
    heartEmoji: '💙',
    primary: '#38bdf8',
    secondary: '#2563eb',
    stardust: ['#38bdf8', '#60a5fa', '#ffffff'],
    glow: 'rgba(56, 189, 248, 0.60)',
    glowSubtle: 'rgba(56, 189, 248, 0.24)',
    secondaryGlow: 'rgba(37, 99, 235, 0.45)',
    border: 'rgba(56, 189, 248, 0.35)',
    btnBg: 'rgba(14, 165, 233, 0.16)',
    btnHoverBg: 'rgba(14, 165, 233, 0.28)',
    bgCenter: 'rgba(14, 165, 233, 0.16)',
    bgCenterDeep: 'rgba(30, 58, 138, 0.10)',
    bgMist: 'rgba(124, 58, 237, 0.12)',
    bgMistSubtle: 'rgba(79, 70, 229, 0.06)',
    btnGradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    btnShadow: '0 10px 30px rgba(37, 99, 235, 0.50)',
    btnShadowHover: '0 14px 40px rgba(56, 189, 248, 0.70)',
  },
  purple: {
    id: 'purple',
    name: 'Nebula Purple',
    heartEmoji: '💜',
    primary: '#c084fc',
    secondary: '#7c3aed',
    stardust: ['#c084fc', '#a855f7', '#ffffff'],
    glow: 'rgba(192, 132, 252, 0.65)',
    glowSubtle: 'rgba(192, 132, 252, 0.25)',
    secondaryGlow: 'rgba(124, 58, 237, 0.45)',
    border: 'rgba(192, 132, 252, 0.35)',
    btnBg: 'rgba(168, 85, 247, 0.16)',
    btnHoverBg: 'rgba(168, 85, 247, 0.28)',
    bgCenter: 'rgba(168, 85, 247, 0.18)',
    bgCenterDeep: 'rgba(88, 28, 135, 0.12)',
    bgMist: 'rgba(109, 40, 217, 0.15)',
    bgMistSubtle: 'rgba(76, 29, 149, 0.07)',
    btnGradient: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
    btnShadow: '0 10px 30px rgba(124, 58, 237, 0.50)',
    btnShadowHover: '0 14px 40px rgba(192, 132, 252, 0.70)',
  },
  pink: {
    id: 'pink',
    name: 'Starlight Pink',
    heartEmoji: '💖',
    primary: '#f472b6',
    secondary: '#db2777',
    stardust: ['#f472b6', '#f43f5e', '#ffffff'],
    glow: 'rgba(244, 114, 182, 0.65)',
    glowSubtle: 'rgba(244, 114, 182, 0.25)',
    secondaryGlow: 'rgba(219, 39, 119, 0.45)',
    border: 'rgba(244, 114, 182, 0.35)',
    btnBg: 'rgba(236, 72, 153, 0.16)',
    btnHoverBg: 'rgba(236, 72, 153, 0.28)',
    bgCenter: 'rgba(236, 72, 153, 0.18)',
    bgCenterDeep: 'rgba(131, 24, 67, 0.12)',
    bgMist: 'rgba(162, 28, 175, 0.15)',
    bgMistSubtle: 'rgba(112, 26, 117, 0.07)',
    btnGradient: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
    btnShadow: '0 10px 30px rgba(219, 39, 119, 0.50)',
    btnShadowHover: '0 14px 40px rgba(244, 114, 182, 0.70)',
  },
  red: {
    id: 'red',
    name: 'Crimson Love',
    heartEmoji: '❤️',
    primary: '#fb7185',
    secondary: '#e11d48',
    stardust: ['#fb7185', '#ef4444', '#ffffff'],
    glow: 'rgba(251, 113, 133, 0.65)',
    glowSubtle: 'rgba(251, 113, 133, 0.25)',
    secondaryGlow: 'rgba(225, 29, 72, 0.45)',
    border: 'rgba(251, 113, 133, 0.35)',
    btnBg: 'rgba(225, 29, 72, 0.16)',
    btnHoverBg: 'rgba(225, 29, 72, 0.28)',
    bgCenter: 'rgba(225, 29, 72, 0.18)',
    bgCenterDeep: 'rgba(136, 19, 55, 0.12)',
    bgMist: 'rgba(159, 18, 57, 0.15)',
    bgMistSubtle: 'rgba(100, 11, 35, 0.07)',
    btnGradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
    btnShadow: '0 10px 30px rgba(225, 29, 72, 0.50)',
    btnShadowHover: '0 14px 40px rgba(251, 113, 133, 0.70)',
  },
  gold: {
    id: 'gold',
    name: 'Solar Gold',
    heartEmoji: '💛',
    primary: '#fbbf24',
    secondary: '#d97706',
    stardust: ['#fbbf24', '#f59e0b', '#ffffff'],
    glow: 'rgba(251, 191, 36, 0.65)',
    glowSubtle: 'rgba(251, 191, 36, 0.25)',
    secondaryGlow: 'rgba(217, 119, 6, 0.45)',
    border: 'rgba(251, 191, 36, 0.35)',
    btnBg: 'rgba(245, 158, 11, 0.16)',
    btnHoverBg: 'rgba(245, 158, 11, 0.28)',
    bgCenter: 'rgba(245, 158, 11, 0.18)',
    bgCenterDeep: 'rgba(180, 83, 9, 0.12)',
    bgMist: 'rgba(217, 119, 6, 0.15)',
    bgMistSubtle: 'rgba(146, 64, 14, 0.07)',
    btnGradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    btnShadow: '0 10px 30px rgba(217, 119, 6, 0.50)',
    btnShadowHover: '0 14px 40px rgba(251, 191, 36, 0.70)',
  },
  orange: {
    id: 'orange',
    name: 'Cosmic Orange',
    heartEmoji: '🧡',
    primary: '#fb923c',
    secondary: '#ea580c',
    stardust: ['#fb923c', '#f97316', '#ffffff'],
    glow: 'rgba(251, 146, 60, 0.65)',
    glowSubtle: 'rgba(251, 146, 60, 0.25)',
    secondaryGlow: 'rgba(234, 88, 12, 0.45)',
    border: 'rgba(251, 146, 60, 0.35)',
    btnBg: 'rgba(249, 115, 22, 0.16)',
    btnHoverBg: 'rgba(249, 115, 22, 0.28)',
    bgCenter: 'rgba(249, 115, 22, 0.18)',
    bgCenterDeep: 'rgba(154, 52, 18, 0.12)',
    bgMist: 'rgba(234, 88, 12, 0.15)',
    bgMistSubtle: 'rgba(124, 45, 18, 0.07)',
    btnGradient: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
    btnShadow: '0 10px 30px rgba(234, 88, 12, 0.50)',
    btnShadowHover: '0 14px 40px rgba(251, 146, 60, 0.70)',
  },
  aqua: {
    id: 'aqua',
    name: 'Aqua Lagoon',
    heartEmoji: '🩵',
    primary: '#2dd4bf',
    secondary: '#0d9488',
    stardust: ['#2dd4bf', '#06b6d4', '#ffffff'],
    glow: 'rgba(45, 212, 191, 0.65)',
    glowSubtle: 'rgba(45, 212, 191, 0.25)',
    secondaryGlow: 'rgba(13, 148, 136, 0.45)',
    border: 'rgba(45, 212, 191, 0.35)',
    btnBg: 'rgba(13, 148, 136, 0.16)',
    btnHoverBg: 'rgba(13, 148, 136, 0.28)',
    bgCenter: 'rgba(20, 184, 166, 0.18)',
    bgCenterDeep: 'rgba(15, 118, 110, 0.12)',
    bgMist: 'rgba(13, 148, 136, 0.15)',
    bgMistSubtle: 'rgba(17, 94, 89, 0.07)',
    btnGradient: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
    btnShadow: '0 10px 30px rgba(13, 148, 136, 0.50)',
    btnShadowHover: '0 14px 40px rgba(45, 212, 191, 0.70)',
  },
  pearl: {
    id: 'pearl',
    name: 'Moonlight Pearl',
    heartEmoji: '🤍',
    primary: '#e2e8f0',
    secondary: '#94a3b8',
    stardust: ['#ffffff', '#cbd5e1', '#94a3b8'],
    glow: 'rgba(241, 245, 249, 0.65)',
    glowSubtle: 'rgba(226, 232, 240, 0.25)',
    secondaryGlow: 'rgba(148, 163, 184, 0.45)',
    border: 'rgba(226, 232, 240, 0.35)',
    btnBg: 'rgba(241, 245, 249, 0.12)',
    btnHoverBg: 'rgba(241, 245, 249, 0.22)',
    bgCenter: 'rgba(226, 232, 240, 0.14)',
    bgCenterDeep: 'rgba(100, 116, 139, 0.10)',
    bgMist: 'rgba(148, 163, 184, 0.12)',
    bgMistSubtle: 'rgba(71, 85, 105, 0.06)',
    btnGradient: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 100%)',
    btnShadow: '0 10px 30px rgba(148, 163, 184, 0.45)',
    btnShadowHover: '0 14px 40px rgba(226, 232, 240, 0.65)',
  },
};

export interface PersonalizationData {
  fromName: string;
  toName: string;
  message: string;
  theme?: CosmicThemeId;
  song?: string;
}

export interface LyricLine {
  time: number;
  endTime?: number;
  text: string;
}

export interface SongConfig {
  id: string;
  title: string;
  artist: string;
  src: string;
  srt?: string; // Path to Subtitle Edit .srt file (e.g. '/song.srt')
  lyrics: LyricLine[];
}

export const SONGS: SongConfig[] = [
  {
    id: 'queen-and-poet',
    title: 'Queen & Poet',
    artist: 'John Michael Howell',
    src: '/song.mp3',
    srt: '/song.srt',
    lyrics: [
      { time: 0.0, text: '♪ • • •' },
      { time: 2.5, text: "You're the fairest in all of the land" },
      { time: 6.2, text: 'Many of kings and their kingdoms have fought for your hand' },
      { time: 11.8, text: "And I know I'm no royal man" },
      { time: 15.2, text: 'But if I could give you the world with my paper and pen' },
      { time: 21.2, text: "I'd write all night, lyrics and rhymes" },
      { time: 26.0, text: 'Tracing these lines through...' },
      { time: 29.5, text: 'Sing these words to the sky' },
      { time: 32.8, text: 'Hoping they find you' },
      { time: 37.5, text: "Darling, you're a queen, and I'm just a poet" },
      { time: 42.2, text: "Writing these songs, hoping you'll notice" },
      { time: 47.0, text: 'Notice me...' },
      { time: 49.0, text: "'Cause I'm just a helpless fool for you" },
      { time: 55.5, text: "I'll write this love till my hands are numb" },
      { time: 60.2, text: "Darling, I'll sing till kingdom come" },
      { time: 65.0, text: "You're a queen, and I'm just a poet" },
      { time: 69.8, text: 'Writing these songs for you...' },
      { time: 76.5, text: '♪ • • •' },
      { time: 79.0, text: 'As long as my heart has a beat' },
      { time: 82.8, text: "There's not a tower too high for these rhythms to reach" },
      { time: 88.5, text: "And I'll scale these walls just like notes on a string" },
      { time: 92.2, text: 'Sing songs in your halls till you hear symphonies' },
      { time: 98.0, text: "I'd write all night, lyrics and rhymes" },
      { time: 102.8, text: 'Tracing these lines through...' },
      { time: 106.2, text: 'Sing these words to the sky' },
      { time: 109.5, text: 'Hoping they find you' },
      { time: 114.2, text: "Darling, you're a queen, and I'm just a poet" },
      { time: 119.0, text: "Writing these songs, hoping you'll notice" },
      { time: 123.8, text: 'Notice me...' },
      { time: 125.8, text: "'Cause I'm just a helpless fool for you" },
      { time: 132.2, text: "I'll write this love till my hands are numb" },
      { time: 137.0, text: "Darling, I'll sing till kingdom come" },
      { time: 141.8, text: "You're a queen, and I'm just a poet" },
      { time: 146.5, text: 'Writing these songs for you...' },
      { time: 151.5, text: 'Till the day these castle walls come down' },
      { time: 156.2, text: "Like Jericho, I'll be singing out" },
      { time: 160.8, text: 'Till the day your heart can hear this sound' },
      { time: 169.0, text: "I'll write this love till my hands are numb" },
      { time: 173.8, text: "Darling, I'll sing till kingdom come" },
      { time: 178.5, text: "You're a queen, and I'm just a poet" },
      { time: 183.2, text: 'Writing these songs for you...' },
      { time: 192.0, text: '♪ • • •' },
    ],
  },
  {
    id: 'its-you',
    title: "It's You",
    artist: 'Ali Gatie',
    src: '/song2.mp3',
    srt: '/song2.srt',
    lyrics: [
      { time: 0.0, text: '♪ • • •' },
      { time: 9.8, text: "It's you, it's always you If I'm ever gonna fall in love" },
      { time: 17.95, text: "I know it's gonna be you It's you, it's always you" },
      { time: 23.28, text: "But a lot of people, but nobody feels like you" },
      { time: 30.28, text: "So please don't break my heart Don't tear me apart" },
      { time: 35.84, text: "I know how it starts Trust me, I've been broken" },
      { time: 40.06, text: "before Don't break me again I am delicate" },
      { time: 45.84, text: "Please don't break my heart Trust me, I've been broken before" },
      { time: 52.76, text: "I've been broken, yeah, I know how it feels To" },
      { time: 56.77, text: "be open and then find out your love isn't real" },
      { time: 62.24, text: "I'm still hurting, yeah, I'm hurting inside I'm so" },
      { time: 66.1, text: "scared to fall in love, but if it's you, then I'll try" },
      { time: 70.24, text: "It's you, it's always you If I'm ever gonna fall in love" },
      { time: 77.84, text: "I know it's gonna be you It's you, it's always you" },
      { time: 84.76, text: "Not a lot of people, but nobody feels like you" },
      { time: 89.76, text: "So please don't break my heart Don't tear me apart" },
      { time: 95.76, text: "I know how it starts Trust me, I've been broken" },
      { time: 99.9, text: "before Don't break me again I am delicate" },
      { time: 107.84, text: "Please don't break my heart Trust me, I've been broken before" },
      { time: 111.84, text: "No, no, I'm not the best at choosing others" },
      { time: 119.84, text: "We both know my past speaks for itself" },
      { time: 124.84, text: "If you don't think that we're right for each other" },
      { time: 130.84, text: "Then, please, don't let history repeat itself" },
      { time: 139.84, text: "'Cause I want you, yeah, I want you" },
      { time: 147.84, text: "It's you, it's always you If I'm ever gonna fall in love" },
      { time: 155.84, text: "I know it's gonna be you" },
    ],
  },
];

export const DEFAULT_SONG_ID = 'queen-and-poet';

export interface Particle {
  // Target position on heart in local coordinates
  targetX: number;
  targetY: number;
  targetZ: number;

  // Current position in screen coordinates
  x: number;
  y: number;
  z: number;

  // Velocity
  vx: number;
  vy: number;
  vz: number;

  // Size and visual parameters
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  shimmerSpeed: number;
  shimmerPhase: number;

  // Type: 'core' (contour & inner body), 'halo' (ambient glow), 'ambient' (drifting background stars), 'burst' (click debris)
  type: 'core' | 'halo' | 'ambient' | 'burst';

  // State
  active: boolean;
  life?: number;
  maxLife?: number;
}

export interface MiniHeart {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  rotation: number;
  vy: number;
  vx: number;
  color: string;
  life: number;
  maxLife: number;
}

export const DEFAULT_ROMANTIC_MESSAGE = `Out of all the stars in the universe, you are the one I would choose.

Maybe I cannot explain everything I feel, but I wanted to create this little universe just for you.

No matter how many stars shine above us, you will always be the one that catches my eye.`;
