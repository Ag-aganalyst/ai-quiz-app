'use client';
import Link from 'next/link';
import { Avatar, Card, Pill } from '@/components/ui';

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM = [
  'border-[#e2b93b] bg-[#fff8dc]',
  'border-[#b8bec7] bg-[#f4f6f8]',
  'border-[#c98a4b] bg-[#fbf1e6]',
];

/** Top 3 mentors as podium cards. Ranked by average points per active student; the total sits beside it. */
export function MentorPodium({ ranking, highlightId, photos = {}, linkBase, pointsLabel = 'pts' }) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {ranking.slice(0, 3).map((m, i) => {
        const inner = (
          <Card pad="p-4" className={`border-2 ${PODIUM[i]} ${m.id === highlightId ? 'ring-brand' : ''} h-full`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{MEDAL[i]}</span>
              <Avatar name={m.name} src={photos[m.id] || m.photo} size="lg" />
              <div className="min-w-0">
                <div className="font-display font-bold text-brand-deep truncate">{m.name}{m.id === highlightId ? ' (you)' : ''}</div>
                <div className="text-xs text-ink-2">{m.batch} · {m.activeStudents} active</div>
              </div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div><div className="text-[10px] uppercase font-semibold text-ink-3">Avg per student</div><div className="font-display text-2xl font-extrabold text-brand-deep tabular">{m.avgPoints.toLocaleString('en-IN')}</div></div>
              <div className="text-right"><div className="text-[10px] uppercase font-semibold text-ink-3">Total</div><div className="font-semibold tabular">{m.totalPoints.toLocaleString('en-IN')} {pointsLabel}</div></div>
            </div>
          </Card>
        );
        return linkBase ? <Link key={m.id} href={`${linkBase}${m.id}`} className="block">{inner}</Link> : <div key={m.id}>{inner}</div>;
      })}
    </div>
  );
}

/** Ranks 4 onward (or all) as a table; the viewer's own row is highlighted. */
export function MentorTable({ ranking, highlightId, from = 4, to = 10, photos = {}, linkBase }) {
  const rows = ranking.filter((m) => m.rank >= from && m.rank <= to);
  if (!rows.length) return <p className="text-xs text-ink-3">Only {ranking.length} mentors so far. Ranks {from} to {to} appear as the team grows.</p>;
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-ink-3"><tr><th className="py-1.5 pr-2">#</th><th className="py-1.5 pr-2">Mentor</th><th className="py-1.5 pr-2 text-right">Active</th><th className="py-1.5 pr-2 text-right">Avg / student</th><th className="py-1.5 text-right">Total</th></tr></thead>
      <tbody>
        {rows.map((m) => (
          <tr key={m.id} className={`border-t border-line ${m.id === highlightId ? 'bg-brand-soft' : ''}`}>
            <td className="py-2 pr-2 font-display font-bold text-ink-3 tabular">{m.rank}</td>
            <td className="py-2 pr-2"><span className="flex items-center gap-2"><Avatar name={m.name} src={photos[m.id] || m.photo} size="sm" />{linkBase ? <Link href={`${linkBase}${m.id}`} className="font-semibold hover:text-brand">{m.name}</Link> : <span className="font-semibold">{m.name}</span>}<span className="text-xs text-ink-3">{m.batch}</span></span></td>
            <td className="py-2 pr-2 text-right tabular">{m.activeStudents}</td>
            <td className="py-2 pr-2 text-right font-semibold tabular">{m.avgPoints.toLocaleString('en-IN')}</td>
            <td className="py-2 text-right tabular text-ink-2">{m.totalPoints.toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Top 3 students across every batch, always shown with their mentor's name. */
export function StarPerformers({ stars, linkBase, compact = false }) {
  return (
    <div className={`grid gap-3 ${compact ? '' : 'sm:grid-cols-3'}`}>
      {stars.map((s, i) => {
        const inner = (
          <Card pad="p-4" className={`border-2 ${PODIUM[i]} h-full`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{MEDAL[i]}</span>
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-brand-deep truncate">{s.name}</div>
                <div className="text-xs text-ink-2 truncate">{s.mentor} · {s.batch}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-extrabold text-brand-deep tabular">{s.points.toLocaleString('en-IN')}</div>
                <div className="text-[11px] text-ink-3">🔥 {s.streak} · Day {s.day}</div>
              </div>
            </div>
          </Card>
        );
        return linkBase ? <Link key={s.id} href={`${linkBase}${s.id}`} className="block">{inner}</Link> : <div key={s.id}>{inner}</div>;
      })}
    </div>
  );
}

export function TieBreakNote() {
  return <p className="mt-2 text-[11px] text-ink-3">Ties break on points, then streak, then average test %. Rankings refresh nightly at the deadline.</p>;
}

export function RankPill({ rank }) {
  return <Pill tone={rank <= 3 ? 'accent' : 'neutral'}>{rank <= 3 ? MEDAL[rank - 1] : `#${rank}`}</Pill>;
}
