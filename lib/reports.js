// Test-analysis report builders (PDF) for a whole batch (admin, mentor) or one student (mentor).
import { buildPdf, downloadBlob } from './pdf';
import { TEST_RECORD_STATUS, fmtLong, mentorById, studentsOf } from './mock-data';

export function studentStats(studentId, records) {
  const mine = records.filter((r) => r.studentId === studentId);
  const verified = mine.filter((r) => r.status === 'verified').length;
  const analysed = mine.filter((r) => r.status === 'verified' || r.status === 'analysis_uploaded').length;
  const pending = mine.filter((r) => r.status === 'awaiting_analysis' || r.status === 'sent_back').length;
  const avg = mine.length ? Math.round(mine.reduce((a, r) => a + r.obtained / r.max, 0) / mine.length * 100) : null;
  const last = [...mine].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  return { appeared: mine.length, analysed, verified, pending, avg, last, records: mine };
}

const today = (d) => fmtLong(d);

/** Whole-batch report: one row per student. Used by the admin for any mentor, and by the mentor for their own batch. */
export function downloadBatchReport(mentorId, records, { by = 'Admin', date = new Date(2026, 9, 5) } = {}) {
  const m = mentorById(mentorId);
  const students = studentsOf(mentorId);
  const stats = students.map((s) => ({ s, st: studentStats(s.id, records) }));
  const totals = stats.reduce((a, { st }) => ({ appeared: a.appeared + st.appeared, analysed: a.analysed + st.analysed, verified: a.verified + st.verified, pending: a.pending + st.pending }), { appeared: 0, analysed: 0, verified: 0, pending: 0 });
  const avgOfAvgs = stats.filter(({ st }) => st.avg != null);
  const avg = avgOfAvgs.length ? Math.round(avgOfAvgs.reduce((a, { st }) => a + st.avg, 0) / avgOfAvgs.length) : 0;
  const blob = buildPdf({
    title: `Test analysis report - ${m.batch}`,
    subtitle: `${m.name} (${m.subject}) - ${students.length} students`,
    meta: [`Generated ${today(date)} by ${by} - Brainy Medic`],
    summary: [`Tests appeared: ${totals.appeared}   Analyses done: ${totals.analysed}   Verified by mentor: ${totals.verified}   Pending: ${totals.pending}   Average: ${avg}%`],
    columns: [
      { label: '#', width: 22 }, { label: 'Student', width: 150 }, { label: 'Student ID', width: 78 }, { label: 'Day', width: 36, align: 'right' },
      { label: 'Appeared', width: 56, align: 'right' }, { label: 'Analysed', width: 56, align: 'right' }, { label: 'Verified', width: 52, align: 'right' }, { label: 'Pending', width: 50, align: 'right' }, { label: 'Avg %', width: 44, align: 'right' },
    ],
    rows: stats.map(({ s, st }, i) => [i + 1, s.name, s.id, s.day, st.appeared, st.analysed, st.verified, st.pending, st.avg == null ? '-' : `${st.avg}%`]),
    footer: 'Appeared = tests the mentor recorded. Analysed = analysis uploaded or verified. Verified = checked by the mentor. Pending = analysis not yet uploaded or sent back.',
  });
  downloadBlob(blob, `${m.batch.replace(/\s+/g, '-')}-test-analysis-report.pdf`);
}

/** One student's report: summary line plus every test record. */
export function downloadStudentReport(student, records, { by = 'Mentor', date = new Date(2026, 9, 5) } = {}) {
  const m = mentorById(student.mentorId);
  const st = studentStats(student.id, records);
  const rows = [...st.records].sort((a, b) => (a.date < b.date ? 1 : -1)).map((r, i) => [i + 1, r.testId, r.type, r.date, `${r.obtained}/${r.max}`, `${Math.round((r.obtained / r.max) * 100)}%`, TEST_RECORD_STATUS[r.status].label.replace(/ · .*/, ''), r.verifiedOn || '-']);
  const blob = buildPdf({
    title: `Test analysis report - ${student.name}`,
    subtitle: `${student.id} - ${student.batch} - Mentor ${m.name} - Day ${student.day} of 90`,
    meta: [`Generated ${today(date)} by ${by} - Brainy Medic`, `Phone ${student.phone} - Parent ${student.parent?.name || '-'} (${student.parent?.phone || '-'})`],
    summary: [`Tests appeared: ${st.appeared}   Analyses done: ${st.analysed}   Verified by mentor: ${st.verified}   Pending: ${st.pending}   Average: ${st.avg == null ? '-' : `${st.avg}%`}`],
    columns: [
      { label: '#', width: 22 }, { label: 'Test ID', width: 70 }, { label: 'Type', width: 80 }, { label: 'Date', width: 70 }, { label: 'Marks', width: 60, align: 'right' }, { label: '%', width: 40, align: 'right' }, { label: 'Status', width: 110 }, { label: 'Verified on', width: 70 },
    ],
    rows: rows.length ? rows : [['-', 'No tests recorded yet', '', '', '', '', '', '']],
    footer: 'Status: Score updated = analysis due from the student; Analysis uploaded = waiting for the mentor; Verified = checked; Sent back = redo asked.',
  });
  downloadBlob(blob, `${student.id}-test-analysis-report.pdf`);
}
