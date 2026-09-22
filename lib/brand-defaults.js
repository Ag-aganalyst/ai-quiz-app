// Everything the owner can customise from the admin console lives here.
// The admin settings page edits a copy of this object; the UI reads it through useSettings().

export const DEFAULT_SETTINGS = {
  brand: {
    appName: 'Brainy Medic',
    shortName: 'BNM',
    tagline: 'One task a day. One mentor who notices.',
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/brand/bnm-logo.png',
    primary: '#2a8d78',
    primaryDeep: '#0f3d34',
    accent: '#f5d020',
    radius: 18,
  },
  labels: {
    admin: 'Admin',
    mentor: 'Mentor',
    student: 'Student',
    parent: 'Parent',
    batch: 'Batch',
    task: 'Daily Task',
    challenge: 'Challenge',
    points: 'Brainy Points',
    streak: 'Streak',
  },
  points: {
    submitOnTime: 10,
    scoreBonusMax: 10,
    uploadProof: 5,
    verified: 5,
    earlyBird: 2,
    rank1: 15,
    rank2: 10,
    rank3: 5,
    perfectWeek: 25,
    milestone7: 50,
    milestone21: 100,
    milestone45: 250,
    milestone90: 1000,
  },
  streak: {
    countsOn: 'submission', // 'submission' | 'verification'
    freezeEveryDays: 15,
    freezeCap: 3,
    lateWindowHours: 6,
    lateCredit: 'half', // 'half' | 'none'
    comebackRestorePercent: 50,
    milestones: '7, 21, 45, 90',
  },
  challenge: {
    days: 90, // every student runs Day 1 to Day 90 from their own joining date
    revisionEvery: 7, // every 7th day is a lighter revision day
    maxItemsPerDay: 2,
  },
  schedule: {
    deadline: '23:59',
    publishBy: '09:00',
    earlyBird: '18:00',
    timezone: 'Asia/Kolkata',
    restDays: [], // Sundays count: the 90-day challenge has no rest days by default
    seatsPerMentor: 50,
  },
  taskTypes: { inApp: true, manual: true, assignment: true },
  features: {
    whatsapp: true,
    doubtThreads: true,
    teams: false,
    seasons: true,
    parentDigest: false,
    aiVerify: true,
    hindi: false,
    rewards: true,
  },
  levels: [
    { name: 'Rookie', min: 0 },
    { name: 'Learner', min: 250 },
    { name: 'Scholar', min: 1000 },
    { name: 'Topper', min: 3000 },
    { name: 'Legend', min: 8000 },
  ],
  messages: {
    welcome:
      'Hi {name}, welcome to {app}! Your Student ID is {id} and your mentor is {mentor}. Tap here to log in: {link}',
    parentWelcome:
      'Namaste {parent}, {name} has joined the {app} 90-day challenge with mentor {mentor}. Track progress with Student ID {id}: {link}',
    reminder: "{name}, today's task closes at {deadline}. Keep your {streak}-day streak alive!",
    verified: 'Nice work {name}. {mentor} ticked your task. +{points} {pointsName}.',
  },
};

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function levelFor(points, levels = DEFAULT_SETTINGS.levels) {
  const sorted = [...levels].sort((a, b) => a.min - b.min);
  let current = sorted[0];
  let next = null;
  for (let i = 0; i < sorted.length; i += 1) {
    if (points >= sorted[i].min) {
      current = sorted[i];
      next = sorted[i + 1] || null;
    }
  }
  return { current, next };
}

export function fillTemplate(template, vars) {
  return String(template || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}
