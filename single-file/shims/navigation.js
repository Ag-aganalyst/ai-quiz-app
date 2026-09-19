// Hash-based stand-in for `next/navigation`, used only by the single-file build.
import { useSyncExternalStore } from 'react';

function read() {
  if (typeof window === 'undefined') return '/';
  const raw = window.location.hash.replace(/^#/, '');
  return raw.startsWith('/') ? raw : `/${raw}`;
}
function subscribe(cb) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}
export function splitUrl(u) {
  const [pathAndQuery, ...frag] = u.split('#');
  const [path, query = ''] = pathAndQuery.split('?');
  return { path: (path || '/').replace(/\/$/, '') || '/', query, fragment: frag.join('#') };
}
export function useHashUrl() {
  return useSyncExternalStore(subscribe, read, () => '/');
}
export function usePathname() {
  return splitUrl(useHashUrl()).path;
}
export function useSearchParams() {
  return new URLSearchParams(splitUrl(useHashUrl()).query);
}
export function useParams() {
  return {};
}
export function useRouter() {
  return {
    push: (to) => { window.location.hash = to; },
    replace: (to) => { window.location.replace(`#${to}`); },
    back: () => window.history.back(),
    prefetch: () => {},
  };
}
