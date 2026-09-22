// Deterministic sample data for the UI prototype. Replace with Supabase queries in phase 1.
// "Today" is pinned to a fixed date so server and client render the same sample values.

export const ANCHOR = new Date(2026, 8, 22); // 22 Sep 2026
export const CHALLENGE_DAYS = 90;
const DAY_MS = 86400000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
export const fmtDate = (d, withWeekday = true) => `${withWeekday ? `${WEEKDAYS[d.getDay()]} ` : ''}${d.getDate()} ${MONTHS[d.getMonth()]}`;
export const fmtLong = (d) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
export const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const dayOf = (joined) => Math.max(1, Math.min(CHALLENGE_DAYS, Math.floor((ANCHOR - joined) / DAY_MS) + 1));
export const dateOfDay = (joined, day) => addDays(joined, day - 1);

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- The 90-day challenge plan (admin-authored; every student walks it from their own Day 1) ----------
const TOPICS = [
  ['Biology', 'Cell: The Unit of Life'], ['Physics', 'Units and Measurements'], ['Chemistry', 'Basic Concepts of Chemistry'],
  ['Biology', 'Biomolecules'], ['Physics', 'Motion in a Straight Line'], ['Chemistry', 'Structure of Atom'],
  ['Biology', 'Cell Cycle and Cell Division'], ['Physics', 'Laws of Motion'], ['Chemistry', 'Chemical Bonding'],
  ['Biology', 'Plant Kingdom'], ['Physics', 'Work, Energy and Power'], ['Chemistry', 'Thermodynamics'],
  ['Biology', 'Animal Kingdom'], ['Physics', 'Rotational Motion'], ['Chemistry', 'Equilibrium'],
  ['Biology', 'Morphology of Flowering Plants'], ['Physics', 'Gravitation'], ['Chemistry', 'Redox Reactions'],
  ['Biology', 'Structural Organisation in Animals'], ['Physics', 'Properties of Solids'], ['Chemistry', 'Hydrocarbons'],
  ['Biology', 'Photosynthesis'], ['Physics', 'Thermodynamics'], ['Chemistry', 'Organic Chemistry Basics'],
  ['Biology', 'Respiration in Plants'], ['Physics', 'Oscillations'], ['Chemistry', 'p-Block Elements'],
  ['Biology', 'Neural Control & Coordination'], ['Physics', 'Waves'], ['Chemistry', 'Coordination Compounds'],
  ['Biology', 'Human Reproduction'], ['Physics', 'Electrostatics'], ['Chemistry', 'Solutions'],
  ['Biology', 'Genetics: Inheritance'], ['Physics', 'Current Electricity'], ['Chemistry', 'Electrochemistry'],
  ['Biology', 'Molecular Basis of Inheritance'], ['Physics', 'Magnetism'], ['Chemistry', 'Chemical Kinetics'],
  ['Biology', 'Evolution'], ['Physics', 'Electromagnetic Induction'], ['Chemistry', 'd- and f-Block Elements'],
  ['Biology', 'Human Health and Disease'], ['Physics', 'Ray Optics'], ['Chemistry', 'Haloalkanes'],
  ['Biology', 'Biotechnology'], ['Physics', 'Wave Optics'], ['Chemistry', 'Alcohols, Phenols, Ethers'],
  ['Biology', 'Ecosystem'], ['Physics', 'Dual Nature of Matter'], ['Chemistry', 'Aldehydes and Ketones'],
  ['Biology', 'Biodiversity'], ['Physics', 'Atoms and Nuclei'], ['Chemistry', 'Amines'],
];
export const TASK_TYPES = {
  test: { label: 'Paper test + upload', icon: '📄', short: 'Test' },
  inapp: { label: 'In-app test', icon: '🧠', short: 'Quick test' },
  assignment: { label: 'Read & summarise', icon: '📚', short: 'Assignment' },
  revision: { label: 'Revision day', icon: '🔁', short: 'Revision' },
};
export const CHALLENGE_PLAN = Array.from({ length: CHALLENGE_DAYS }, (_, i) => {
  const day = i + 1;
  const [subject, topic] = TOPICS[i % TOPICS.length];
  const revision = day % 7 === 0;
  const type = revision ? 'revision' : ['test', 'inapp', 'assignment'][i % 3];
  const title = revision ? 'Revision: retry your mistake notebook' : type === 'test' ? `Test: ${topic}` : type === 'inapp' ? `Quick test: ${topic}` : `Read & summarise: ${topic}`;
  return { day, subject: revision ? 'All subjects' : subject, topic, type, title, durationMin: revision ? 30 : type === 'test' ? 45 : type === 'inapp' ? 20 : 40, points: revision ? 15 : 30, outOf: type === 'inapp' ? 20 : 30, material: type === 'test' ? `Day${String(day).padStart(2, '0')}_${topic.replace(/[^A-Za-z]+/g, '_')}.pdf` : null };
});
// Day 34 is the worked example used across the student task flow.
CHALLENGE_PLAN[33] = { ...CHALLENGE_PLAN[33], subject: 'Biology', topic: 'Neural Control & Coordination', type: 'test', title: 'Test: Neural Control & Coordination', durationMin: 45, points: 30, outOf: 20, material: 'Day34_Neural_Control.pdf' };
// Day 43 is a test whose paper the admin has not attached yet (drives an alert on the overview).
CHALLENGE_PLAN[42] = { ...CHALLENGE_PLAN[42], material: null };

export const TODAY_TASK = {
  id: 'day-34',
  day: 34,
  title: 'Neural Control & Coordination',
  subject: 'Biology',
  type: 'test',
  typeLabel: 'Paper test + upload',
  durationMin: 45,
  deadline: '23:59',
  points: 30,
  paper: 'Day34_Neural_Control.pdf',
  description: '20 previous-year style MCQs on nerve impulse conduction, synaptic transmission and the reflex arc. Solve on paper, then upload a clear photo of every page.',
  questions: [
    { id: 'q1', topic: 'Nerve impulse', question: 'During the depolarisation phase of an action potential, which ion movement is primarily responsible for the rapid rise in membrane potential?', options: ['K⁺ efflux through voltage-gated channels', 'Na⁺ influx through voltage-gated channels', 'Cl⁻ influx through ligand-gated channels', 'Ca²⁺ efflux via the Na⁺/K⁺ pump'], correct: 1, explanation: 'Voltage-gated Na⁺ channels open at threshold and Na⁺ rushes in, driving the membrane potential toward +30 mV. K⁺ efflux causes repolarisation, not depolarisation.' },
    { id: 'q2', topic: 'Synaptic transmission', question: 'Which statement about chemical synapses is INCORRECT?', options: ['Neurotransmitter release requires Ca²⁺ entry into the axon terminal', 'Transmission is unidirectional', 'The synaptic cleft is bridged by gap junctions', 'Neurotransmitters bind to receptors on the post-synaptic membrane'], correct: 2, explanation: 'Gap junctions are the hallmark of electrical synapses. A chemical synapse has a fluid-filled cleft that neurotransmitters diffuse across.' },
    { id: 'q3', topic: 'Reflex arc', question: 'In a monosynaptic knee-jerk reflex, the cell body of the afferent neuron lies in the', options: ['Ventral horn of the spinal cord', 'Dorsal root ganglion', 'Sympathetic chain ganglion', 'Grey matter of the medulla'], correct: 1, explanation: 'Sensory (afferent) neurons are pseudounipolar with cell bodies in the dorsal root ganglion. Motor neuron cell bodies sit in the ventral horn.' },
  ],
};

// ---------- Mentors ----------
export const MENTORS = [
  { id: 'm1', name: 'Dr. Anjali Rao', batch: 'Batch A', batchNick: 'Morning Warriors', subject: 'Biology', qualification: 'MBBS, AIIMS Delhi', phone: '9810011223', email: 'anjali@brainymedic.in', joined: new Date(2026, 5, 1), photo: '', streak: 19, seats: 47, completion: 84, turnaround: 6, avgScore: 71, publishedAt: '8:40 AM', trend: [70, 74, 78, 80, 82, 84, 84], verifications: 1240 },
  { id: 'm2', name: 'Prof. Sameer Kulkarni', batch: 'Batch B', batchNick: 'Night Owls', subject: 'Chemistry', qualification: 'M.Sc., IIT Bombay', phone: '9820022334', email: 'sameer@brainymedic.in', joined: new Date(2026, 5, 15), photo: '', streak: 11, seats: 47, completion: 76, turnaround: 14, avgScore: 66, publishedAt: '9:15 AM', trend: [80, 78, 77, 74, 75, 76, 76], verifications: 980 },
  { id: 'm3', name: 'Ms. Farah Siddiqui', batch: 'Batch C', batchNick: 'Steady Climbers', subject: 'Physics', qualification: 'M.Sc., Jamia Millia', phone: '9830033445', email: 'farah@brainymedic.in', joined: new Date(2026, 6, 1), photo: '', streak: 33, seats: 50, completion: 91, turnaround: 4, avgScore: 74, publishedAt: '8:05 AM', trend: [85, 88, 90, 89, 92, 91, 91], verifications: 1510 },
  { id: 'm4', name: 'Dr. Vikram Menon', batch: 'Batch D', batchNick: 'Fresh Starters', subject: 'Biology', qualification: 'BDS, Manipal', phone: '9840044556', email: 'vikram@brainymedic.in', joined: new Date(2026, 8, 1), photo: '', streak: 0, seats: 23, completion: 63, turnaround: 27, avgScore: 61, publishedAt: null, trend: [70, 68, 66, 64, 62, 60, 63], verifications: 140 },
];
export const MENTOR = MENTORS[0];
export const mentorById = (id) => MENTORS.find((m) => m.id === id) || MENTORS[0];

export const MENTOR_JOURNEY = {
  m1: [
    { when: '1 Jun', what: 'Joined Brainy Medic as Biology mentor' },
    { when: '3 Jun', what: 'Enrolled the first 20 students from Excel' },
    { when: '4 Jun', what: 'First verification: 18 uploads in 9 minutes' },
    { when: '2 Jul', what: 'Batch A reached 40 students' },
    { when: '9 Aug', what: '1,000 verifications milestone' },
    { when: '1 Sep', what: 'Batch A: best weekly completion (88%)' },
    { when: '19 Sep', what: 'Mentor streak: 19 days of same-day verification' },
  ],
  m2: [{ when: '15 Jun', what: 'Joined as Chemistry mentor' }, { when: '20 Jun', what: 'Enrolled 47 students' }, { when: '11 Aug', what: 'Verification turnaround slipped past 12 hours' }],
  m3: [{ when: '1 Jul', what: 'Joined as Physics mentor' }, { when: '2 Jul', what: 'Batch C full on day one' }, { when: '30 Aug', what: '33-day mentor streak, best in the school' }],
  m4: [{ when: '1 Sep', what: 'Joined as Biology mentor' }, { when: '3 Sep', what: 'Enrolled 23 students' }],
};

// ---------- Students, per batch ----------
const FIRST = ['Riya', 'Aarav', 'Ishaan', 'Diya', 'Kabir', 'Ananya', 'Vihaan', 'Saanvi', 'Arjun', 'Meera', 'Rohan', 'Kavya', 'Aditya', 'Tanvi', 'Yash', 'Nisha', 'Dev', 'Pooja', 'Karan', 'Sneha', 'Rahul', 'Priya', 'Nikhil', 'Shruti', 'Varun', 'Anjali', 'Manav', 'Isha', 'Siddharth', 'Neha', 'Harsh', 'Simran', 'Om', 'Ritika', 'Parth', 'Aditi', 'Sahil', 'Kriti', 'Tanish', 'Mansi', 'Ayaan', 'Bhavya', 'Rudra', 'Sakshi', 'Kunal', 'Palak', 'Jay', 'Trisha', 'Vivaan', 'Nandini', 'Aman', 'Zara', 'Reyansh', 'Myra', 'Advait', 'Kiara', 'Atharv', 'Anika', 'Dhruv', 'Ira'];
const LAST = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Iyer', 'Khan', 'Singh', 'Gupta', 'Nair', 'Mehta', 'Joshi', 'Das', 'Rao', 'Chauhan', 'Bose', 'Kulkarni', 'Mishra', 'Yadav', 'Pillai', 'Kapoor'];
const PARENT_FIRST = ['Sunita', 'Rajesh', 'Meena', 'Anil', 'Kavita', 'Suresh', 'Geeta', 'Manoj', 'Rekha', 'Vinod'];
const STATUSES = ['verified', 'verified', 'verified', 'verified', 'submitted', 'submitted', 'submitted', 'not_started', 'not_started', 'missed'];

function makeBatch(mentor, count, seed, startIndex, typicalDaysAgo) {
  const rand = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[(i + seed) % FIRST.length];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const daysAgo = Math.max(0, Math.min(CHALLENGE_DAYS - 1, Math.round(typicalDaysAgo + (rand() - 0.5) * 24)));
    const joined = addDays(ANCHOR, -daysAgo);
    const day = dayOf(joined);
    const avg = 45 + Math.floor(rand() * 45);
    const streak = status === 'missed' ? 0 : Math.min(day, Math.floor(rand() * 40));
    const tests = CHALLENGE_PLAN.filter((p) => p.day < day && (p.type === 'test' || p.type === 'inapp')).map((p) => {
      const pct = Math.max(20, Math.min(100, avg + Math.round((rand() - 0.5) * 30)));
      return { day: p.day, name: p.title.replace(/^(Test|Quick test): /, ''), date: dateOfDay(joined, p.day), outOf: p.outOf, marks: Math.round((pct / 100) * p.outOf), pct };
    });
    const avgPct = tests.length ? Math.round(tests.reduce((a, t) => a + t.pct, 0) / tests.length) : null;
    return {
      id: `BM-26-0${startIndex + i}`,
      name: `${first} ${last}`,
      phone: `98${String(10000000 + Math.floor(rand() * 89999999))}`,
      email: `${first.toLowerCase()}.${String(startIndex + i)}@example.com`,
      mentorId: mentor.id,
      batch: mentor.batch,
      status,
      joined,
      day,
      streak,
      points: 60 + Math.floor(day * (8 + rand() * 20)),
      avgScore: avgPct ?? avg,
      lastScore: tests.length ? tests[tests.length - 1].pct : null,
      tests,
      activation: rand() < 0.92 ? 'Active' : 'Invited',
      missedLast5: status === 'missed' ? 1 + Math.floor(rand() * 3) : Math.floor(rand() * 2),
      weekly: Array.from({ length: 7 }, () => Math.max(20, Math.min(100, avg + Math.floor(rand() * 30) - 15))),
      parent: { name: `${PARENT_FIRST[Math.floor(rand() * PARENT_FIRST.length)]} ${last}`, phone: `97${String(10000000 + Math.floor(rand() * 89999999))}` },
      photo: '',
    };
  });
}

export const BATCH_A = makeBatch(MENTORS[0], 47, 11, 101, 33);
export const BATCH_B = makeBatch(MENTORS[1], 47, 23, 201, 40);
export const BATCH_C = makeBatch(MENTORS[2], 50, 37, 301, 60);
export const BATCH_D = makeBatch(MENTORS[3], 23, 51, 401, 8);
export const ALL_STUDENTS = [...BATCH_A, ...BATCH_B, ...BATCH_C, ...BATCH_D];
export const STUDENTS = BATCH_A;
export const studentsOf = (mentorId) => ALL_STUDENTS.filter((s) => s.mentorId === mentorId);
export const studentById = (id) => ALL_STUDENTS.find((s) => s.id === id);

// The signed-in student in the prototype is a real member of Batch A.
const ME_JOINED = addDays(ANCHOR, -33);
Object.assign(BATCH_A[42], {
  id: 'BM-26-0143',
  name: 'Riya Sharma',
  email: 'riya.143@example.com',
  phone: '9866077889',
  status: 'not_started',
  joined: ME_JOINED,
  day: 34,
  streak: 12,
  points: 1240,
  avgScore: 76,
  lastScore: 85,
  weekly: [62, 70, 68, 74, 81, 78, 85],
  activation: 'Active',
  missedLast5: 0,
  missedDays: [9, 21],
  parent: { name: 'Sunita Sharma', phone: '9700011223' },
  tests: CHALLENGE_PLAN.filter((p) => p.day < 34 && (p.type === 'test' || p.type === 'inapp')).map((p, i) => {
    const pct = [62, 70, 68, 74, 81, 78, 85, 72, 79, 83, 77, 85, 80, 88, 74, 85, 90, 82, 86, 85][i % 20];
    return { day: p.day, name: p.title.replace(/^(Test|Quick test): /, ''), date: dateOfDay(ME_JOINED, p.day), outOf: p.outOf, marks: Math.round((pct / 100) * p.outOf), pct };
  }),
});
export const STUDENT_ME = {
  ...BATCH_A[42],
  bestStreak: 21,
  freezes: 1,
  weakTopics: ['Synaptic transmission', 'Reflex arc'],
  rankBand: 'Top 20%',
  mistakes: 14,
  ledger: [
    { when: 'Yesterday', what: 'Submitted before deadline', pts: 10 },
    { when: 'Yesterday', what: 'Score bonus (85%)', pts: 8 },
    { when: 'Yesterday', what: 'Proof uploaded', pts: 5 },
    { when: 'Yesterday', what: 'Verified by mentor', pts: 5 },
    { when: 'Wed', what: 'Rank 3 in batch', pts: 5 },
    { when: 'Mon', what: '21-day streak milestone', pts: 100 },
  ],
  badges: [
    { name: 'First upload', icon: '📸', earned: true },
    { name: '7-day streak', icon: '🔥', earned: true },
    { name: 'Comeback', icon: '🔁', earned: true },
    { name: 'Rank 1', icon: '🥇', earned: false },
    { name: 'Perfect 90', icon: '🏆', earned: false },
  ],
};

// A strong Batch B student so the star performers are not all from one mentor.
Object.assign(BATCH_B[5], { points: 1902, streak: 41, avgScore: 82 });

// ---------- Parent ----------
export const PARENT = {
  name: 'Sunita Sharma',
  phone: '9700011223',
  children: ['BM-26-0143', BATCH_C[7].id],
};
Object.assign(BATCH_C[7], { name: 'Aman Sharma', parent: { name: 'Sunita Sharma', phone: '9700011223' } });

// ---------- Rankings ----------
export const LEADERBOARD = [...BATCH_A].sort((a, b) => b.points - a.points).slice(0, 10).map((s, i) => ({ rank: i + 1, id: s.id, name: s.name, points: s.points, streak: s.streak }));
export const STAR_PERFORMERS = [...ALL_STUDENTS].sort((a, b) => b.points - a.points || b.streak - a.streak).slice(0, 3).map((s, i) => ({ rank: i + 1, id: s.id, name: s.name, points: s.points, streak: s.streak, mentor: mentorById(s.mentorId).name, batch: s.batch, day: s.day }));
export const MENTOR_RANKING = MENTORS.map((m) => {
  const active = studentsOf(m.id).filter((s) => s.activation === 'Active');
  const total = active.reduce((a, s) => a + s.points, 0);
  return { ...m, activeStudents: active.length, totalPoints: total, avgPoints: active.length ? Math.round(total / active.length) : 0 };
}).sort((a, b) => b.avgPoints - a.avgPoints).map((m, i) => ({ ...m, rank: i + 1 }));

// ---------- Mentor screens ----------
export const SCORE_BUCKETS = [
  { label: '0–20', value: 1 }, { label: '21–40', value: 4 }, { label: '41–60', value: 9 }, { label: '61–80', value: 15 }, { label: '81–100', value: 7 },
];
export const HARD_QUESTIONS = [
  { q: 'Q7 · Saltatory conduction speed vs. axon diameter', wrong: 68 },
  { q: 'Q12 · Inhibitory post-synaptic potential', wrong: 61 },
  { q: 'Q3 · Role of Ca²⁺ in vesicle fusion', wrong: 44 },
];
export const VERIFY_QUEUE = BATCH_A.filter((s) => s.status === 'submitted').slice(0, 8).map((s, i) => ({
  id: `v-${i}`,
  student: s,
  task: CHALLENGE_PLAN[s.day - 1],
  submittedAt: ['6:12 PM', '6:40 PM', '7:05 PM', '7:42 PM', '8:10 PM', '8:33 PM', '9:01 PM', '9:27 PM'][i],
  pages: 1 + (i % 3),
  selfMarks: 11 + ((i * 3) % 9),
  outOf: 20,
  minutes: 28 + ((i * 7) % 20),
  aiFlag: i === 2 ? 'Page 2 looks blurry' : i === 5 ? 'Possible wrong task' : null,
}));
export const TEST_ANALYSIS_QUEUE = BATCH_A.filter((s) => s.status === 'submitted' || s.status === 'verified').slice(8, 14).map((s, i) => ({
  id: `t-${i}`,
  student: s,
  task: CHALLENGE_PLAN[s.day - 1],
  selfMarks: 12 + ((i * 5) % 8),
  outOf: 20,
  systemPct: 55 + ((i * 11) % 40),
  weak: [['Synaptic transmission', 'Reflex arc'], ['Nerve impulse'], ['Reflex arc', 'Neurotransmitters'], ['Action potential'], ['Synaptic transmission'], ['Nerve impulse', 'Reflex arc']][i],
  submittedAt: ['5:50 PM', '6:22 PM', '6:58 PM', '7:31 PM', '8:04 PM', '8:47 PM'][i],
}));
export const AT_RISK = BATCH_A.filter((s) => s.missedLast5 >= 2 || s.status === 'missed').slice(0, 5);

/** Day-N distribution of a batch: how many students are on which challenge day today. */
export function dayGroups(students) {
  const map = {};
  students.forEach((s) => { map[s.day] = (map[s.day] || 0) + 1; });
  return Object.entries(map).map(([day, count]) => ({ day: Number(day), count, task: CHALLENGE_PLAN[Number(day) - 1] })).sort((a, b) => b.count - a.count);
}

/** Deterministic per-day report series for a mentor over the last `days` days (or a custom range). */
export function mentorReport(mentorId, from, to) {
  const m = mentorById(mentorId);
  const rand = rng(mentorId.charCodeAt(1) * 977 + from.getTime() / DAY_MS);
  const rows = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    rows.push({ date: new Date(d), completion: Math.max(30, Math.min(100, m.completion + Math.round((rand() - 0.5) * 20))), verified: Math.round(m.seats * (0.5 + rand() * 0.45)), turnaround: Math.max(1, Math.round(m.turnaround + (rand() - 0.5) * 8)), avgScore: Math.max(30, Math.min(98, m.avgScore + Math.round((rand() - 0.5) * 16))) });
  }
  const avg = (k) => Math.round(rows.reduce((a, r) => a + r[k], 0) / Math.max(1, rows.length));
  return { rows, completion: avg('completion'), verified: rows.reduce((a, r) => a + r.verified, 0), turnaround: avg('turnaround'), avgScore: avg('avgScore'), streaksKept: Math.round(m.seats * 0.7), atRisk: Math.round(m.seats * 0.08) };
}

export const ADMIN = {
  kpis: { students: ALL_STUDENTS.length, activeToday: ALL_STUDENTS.filter((s) => s.status !== 'not_started').length, completion: 79, turnaroundHrs: 9, waiting: 4, seatsLeft: 200 - ALL_STUDENTS.length },
  waiting: [
    { name: 'Aarohi Deshmukh', phone: '9811022334', email: 'aarohi.d@example.com', from: 'Batch A', since: '2 days' },
    { name: 'Mohit Bansal', phone: '9822033445', email: 'mohit.b@example.com', from: 'Batch A', since: '2 days' },
    { name: 'Zoya Ansari', phone: '9833044556', email: 'zoya.a@example.com', from: 'Batch C', since: '1 day' },
    { name: 'Pranav Hegde', phone: '9844055667', email: 'pranav.h@example.com', from: 'Batch C', since: '5 hours' },
  ],
  alerts: [
    { tone: 'critical', text: 'Batch D verification backlog is 27 hours, above the 24-hour limit.', when: '10:02 AM' },
    { tone: 'warn', text: 'Day 43 of the challenge plan is a test with no paper attached yet.', when: '9:30 AM' },
    { tone: 'brand', text: '4 students are waiting for a seat. Batch D has 27 seats free.', when: 'Yesterday' },
    { tone: 'good', text: 'Batch C hit 91% completion, best this month.', when: 'Yesterday' },
  ],
};
