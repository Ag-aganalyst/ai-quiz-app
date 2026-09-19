// Stand-in for `next/link`: internal routes become hash links so the app works from a single file.
export default function Link({ href, children, ...rest }) {
  const to = typeof href === 'string' ? href : '/';
  const external = /^(https?:)?\/\//.test(to);
  return (
    <a href={external ? to : `#${to}`} {...rest}>
      {children}
    </a>
  );
}
