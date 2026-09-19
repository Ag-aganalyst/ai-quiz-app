// Deterministic sample data for the UI prototype. Replace with Supabase queries in phase 1.

const FIRST = ['Riya', 'Aarav', 'Ishaan', 'Diya', 'Kabir', 'Ananya', 'Vihaan', 'Saanvi', 'Arjun', 'Meera', 'Rohan', 'Kavya', 'Aditya', 'Tanvi', 'Yash', 'Nisha', 'Dev', 'Pooja', 'Karan', 'Sneha', 'Rahul', 'Priya', 'Nikhil', 'Shruti', 'Varun', 'Anjali', 'Manav', 'Isha', 'Siddharth', 'Neha', 'Harsh', 'Simran', 'Om', 'Ritika', 'Parth', 'Aditi', 'Sahil', 'Kriti', 'Tanish', 'Mansi', 'Ayaan', 'Bhavya', 'Rudra', 'Sakshi', 'Kunal', 'Palak', 'Jay', 'Trisha', 'Vivaan', 'Nandini'];
const LAST = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Iyer', 'Khan', 'Singh', 'Gupta', 'Nair', 'Mehta', 'Joshi', 'Das', 'Rao', 'Chauhan', 'Bose', 'Kulkarni', 'Mishra', 'Yadav', 'Pillai', 'Kapoor'];

function rng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(20260919);
const STATUSES = ['verified', 'verified', 'verified', 'verified', 'submitted', 'submitted', 'submitted', 'not_started', 'not_started', 'missed'];

export const MENTOR = { name: 'Dr. Anjali Rao', batch: 'Batch A', batchNick: 'Morning Warriors', email: 'anjali@brainymedia.in', streak: 19 };

export const BATCH_SIZE = 47; // 3 seats free, so the Excel upload demo shows both enrolled and waiting rows

export const STUDENTS = Array.from({ length: BATCH_SIZE }, (_, i) => {
  const name = `${FIRST[i]} ${LAST[Math.floor(rand() * LAST.length)]}`;
  const status = STATUSES[Math.floor(rand() * STATUSES.length)];
  const streak = status === 'missed' ? 0 : Math.floor(rand() * 40);
  const avg = 45 + Math.floor(rand() * 45);
  return {
    id: `BM-26-0${101 + i}`,
    name,
    phone: `98${String(10000000 + Math.floor(rand() * 89999999))}`,
    email: `${FIRST[i].toLowerCase()}.${String(i + 1).padStart(2, '0')}@example.com`,
    status,
    streak,
    points: 200 + Math.floor(rand() * 2200),
    avgScore: avg,
    lastScore: Math.max(0, Math.min(100, avg + Math.floor(rand() * 30) - 15)),
    activation: rand() < 0.9 ? 'Active' : 'Invited',
    missedLast5: status === 'missed' ? 1 + Math.floor(rand() * 3) : Math.floor(rand() * 2),
    weekly: Array.from({ length: 7 }, () => Math.max(20, Math.min(100, avg + Math.floor(rand() * 30) - 15))),
  };
});

export const TODAY_TASK = {
  id: 'task-2026-09-19',
  title: 'Neural Control & Coordination',
  subject: 'Biology',
  type: 'manual',
  typeLabel: 'Manual test · upload answer sheet',
  durationMin: 45,
  deadline: '23:59',
  points: 30,
  paper: 'Neural_Control_Set3.pdf',
  description: '20 previous-year style MCQs on nerve impulse conduction, synaptic transmission and the reflex arc. Solve on paper, then upload a clear photo of every page.',
  questions: [
    {
      id: 'q1',
      topic: 'Nerve impulse',
      question: 'During the depolarisation phase of an action potential, which ion movement is primarily responsible for the rapid rise in membrane potential?',
      options: ['K⁺ efflux through voltage-gated channels', 'Na⁺ influx through voltage-gated channels', 'Cl⁻ influx through ligand-gated channels', 'Ca²⁺ efflux via the Na⁺/K⁺ pump'],
      correct: 1,
      explanation: 'Voltage-gated Na⁺ channels open at threshold and Na⁺ rushes in, driving the membrane potential toward +30 mV. K⁺ efflux causes repolarisation, not depolarisation.',
    },
    {
      id: 'q2',
      topic: 'Synaptic transmission',
      question: 'Which statement about chemical synapses is INCORRECT?',
      options: ['Neurotransmitter release requires Ca²⁺ entry into the axon terminal', 'Transmission is unidirectional', 'The synaptic cleft is bridged by gap junctions', 'Neurotransmitters bind to receptors on the post-synaptic membrane'],
      correct: 2,
      explanation: 'Gap junctions are the hallmark of electrical synapses. A chemical synapse has a fluid-filled cleft that neurotransmitters diffuse across.',
    },
    {
      id: 'q3',
      topic: 'Reflex arc',
      question: 'In a monosynaptic knee-jerk reflex, the cell body of the afferent neuron lies in the',
      options: ['Ventral horn of the spinal cord', 'Dorsal root ganglion', 'Sympathetic chain ganglion', 'Grey matter of the medulla'],
      correct: 1,
      explanation: 'Sensory (afferent) neurons are pseudounipolar with cell bodies in the dorsal root ganglion. Motor neuron cell bodies sit in the ventral horn.',
    },
  ],
};

export const STUDENT_ME = {
  name: 'Riya Sharma',
  id: 'BM-26-0143',
  streak: 12,
  bestStreak: 21,
  freezes: 1,
  points: 1240,
  weekly: [62, 70, 68, 74, 81, 78, 85],
  weakTopics: ['Synaptic transmission', 'Reflex arc'],
  rankBand: 'Top 20%',
  mistakes: 14,
  ledger: [
    { when: 'Yesterday', what: 'Submitted before deadline', pts: 10 },
    { when: 'Yesterday', what: 'Score bonus (85%)', pts: 8 },
    { when: 'Yesterday', what: 'Proof uploaded', pts: 5 },
    { when: 'Yesterday', what: 'Verified by mentor', pts: 5 },
    { when: 'Wed', what: 'Rank 3 in batch', pts: 5 },
    { when: 'Mon', what: '7-day streak milestone', pts: 50 },
  ],
  badges: [
    { name: 'First upload', icon: '📸', earned: true },
    { name: '7-day streak', icon: '🔥', earned: true },
    { name: 'Comeback', icon: '🔁', earned: true },
    { name: 'Rank 1', icon: '🥇', earned: false },
    { name: '21-day streak', icon: '⚡', earned: false },
  ],
};

export const LEADERBOARD = [...STUDENTS]
  .sort((a, b) => b.points - a.points)
  .slice(0, 10)
  .map((s, i) => ({ rank: i + 1, name: s.name, points: s.points, streak: s.streak }));

export const SCORE_BUCKETS = [
  { label: '0–20', value: 1 },
  { label: '21–40', value: 4 },
  { label: '41–60', value: 9 },
  { label: '61–80', value: 15 },
  { label: '81–100', value: 7 },
];

export const HARD_QUESTIONS = [
  { q: 'Q7 · Saltatory conduction speed vs. axon diameter', wrong: 68 },
  { q: 'Q12 · Inhibitory post-synaptic potential', wrong: 61 },
  { q: 'Q3 · Role of Ca²⁺ in vesicle fusion', wrong: 44 },
];

export const VERIFY_QUEUE = STUDENTS.filter((s) => s.status === 'submitted')
  .slice(0, 8)
  .map((s, i) => ({
    id: `v-${i}`,
    student: s,
    submittedAt: ['6:12 PM', '6:40 PM', '7:05 PM', '7:42 PM', '8:10 PM', '8:33 PM', '9:01 PM', '9:27 PM'][i],
    pages: 1 + (i % 3),
    selfMarks: 11 + (i * 3) % 9,
    outOf: 20,
    minutes: 28 + (i * 7) % 20,
    aiFlag: i === 2 ? 'Page 2 looks blurry' : i === 5 ? 'Possible wrong task' : null,
  }));

export const AT_RISK = STUDENTS.filter((s) => s.missedLast5 >= 2 || s.status === 'missed').slice(0, 5);

export const ADMIN = {
  kpis: { students: 170, activeToday: 141, completion: 79, turnaroundHrs: 9, waiting: 4, seatsLeft: 30 },
  mentors: [
    { name: 'Dr. Anjali Rao', batch: 'Batch A', students: 50, completion: 84, turnaround: 6, avgScore: 71, publishedAt: '8:40 AM', streak: 19, trend: [70, 74, 78, 80, 82, 84, 84] },
    { name: 'Prof. Sameer Kulkarni', batch: 'Batch B', students: 47, completion: 76, turnaround: 14, avgScore: 66, publishedAt: '9:15 AM', streak: 11, trend: [80, 78, 77, 74, 75, 76, 76] },
    { name: 'Ms. Farah Siddiqui', batch: 'Batch C', students: 50, completion: 91, turnaround: 4, avgScore: 74, publishedAt: '8:05 AM', streak: 33, trend: [85, 88, 90, 89, 92, 91, 91] },
    { name: 'Dr. Vikram Menon', batch: 'Batch D', students: 23, completion: 63, turnaround: 27, avgScore: 61, publishedAt: null, streak: 0, trend: [70, 68, 66, 64, 62, 60, 63] },
  ],
  waiting: [
    { name: 'Aarohi Deshmukh', phone: '9811022334', email: 'aarohi.d@example.com', from: 'Batch A', since: '2 days' },
    { name: 'Mohit Bansal', phone: '9822033445', email: 'mohit.b@example.com', from: 'Batch A', since: '2 days' },
    { name: 'Zoya Ansari', phone: '9833044556', email: 'zoya.a@example.com', from: 'Batch C', since: '1 day' },
    { name: 'Pranav Hegde', phone: '9844055667', email: 'pranav.h@example.com', from: 'Batch C', since: '5 hours' },
  ],
  alerts: [
    { tone: 'critical', text: 'Batch D has no task published today (publish-by was 9:00 AM).', when: '10:02 AM' },
    { tone: 'warn', text: 'Batch B verification backlog is 31, above the limit of 30.', when: '9:30 AM' },
    { tone: 'brand', text: '4 students are waiting for a seat. Batch D has 27 seats free.', when: 'Yesterday' },
    { tone: 'good', text: 'Batch C hit 91% completion, best this month.', when: 'Yesterday' },
  ],
};
