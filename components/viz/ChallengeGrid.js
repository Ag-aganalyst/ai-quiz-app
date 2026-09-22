'use client';
/**
 * The 90-day challenge as a grid of days. Each cell carries an icon + title so state never rides on colour alone.
 * States: done, missed, today, revision (future lighter day), future.
 */
export default function ChallengeGrid({ total = 90, day = 1, missedDays = [], revisionEvery = 7, milestones = [7, 21, 45, 90], compact = false }) {
  const cells = Array.from({ length: total }, (_, i) => i + 1);
  const state = (d) => (missedDays.includes(d) ? 'missed' : d < day ? 'done' : d === day ? 'today' : d % revisionEvery === 0 ? 'revision' : 'future');
  const cls = {
    done: 'bg-brand text-white',
    missed: 'bg-critical text-white',
    today: 'bg-accent text-brand-ink ring-2 ring-brand-deep',
    revision: 'bg-white text-ink-3 border border-dashed border-brand-200',
    future: 'bg-page text-ink-3 border border-line',
  };
  const icon = { done: '✓', missed: '✕', today: '●', revision: '↻', future: '' };
  const label = { done: 'Done', missed: 'Missed', today: 'Today', revision: 'Revision day', future: 'Upcoming' };
  return (
    <div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${compact ? 10 : 15}, minmax(0, 1fr))` }}>
        {cells.map((d) => {
          const st = state(d);
          const ms = milestones.includes(d);
          return (
            <div key={d} title={`Day ${d} · ${label[st]}${ms ? ' · milestone' : ''}`} className={`relative aspect-square rounded-md flex items-center justify-center text-[10px] font-bold ${cls[st]}`}>
              {st === 'done' || st === 'missed' || st === 'today' ? icon[st] : ms ? '★' : compact ? '' : d}
              {ms && st !== 'future' && <span className="absolute -top-1 -right-1 text-[9px]" aria-hidden="true">★</span>}
            </div>
          );
        })}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-2">
        {['done', 'today', 'missed', 'revision', 'future'].map((k) => (
          <li key={k} className="inline-flex items-center gap-1.5"><span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[8px] ${cls[k]}`}>{icon[k]}</span>{label[k]}</li>
        ))}
        <li className="inline-flex items-center gap-1.5">★ Milestone</li>
      </ul>
    </div>
  );
}
