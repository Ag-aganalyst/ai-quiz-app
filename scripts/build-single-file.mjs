// Bundles the Brainy Medic UI prototype into ONE self-contained HTML file (dist/brainy-medic.html):
// React + the app code, the Tailwind CSS, the fonts and the logo are all inlined. Open it by double-clicking.
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.join(root, p);
const b64 = (p, mime) => `data:${mime};base64,${fs.readFileSync(rel(p)).toString('base64')}`;

// 1. Styles: Tailwind v4 over app/globals.css (same source the Next.js build uses), plus self-hosted fonts.
const cssEntry = rel('app/globals.css');
const { css: appCss } = await postcss([tailwind({ base: root })]).process(fs.readFileSync(cssEntry, 'utf8'), { from: cssEntry });
const fontCss = fs.readFileSync(rel('single-file/fonts.css'), 'utf8').replace(/url\(fonts\/([^)]+)\)/g, (m, file) => `url(${b64(`single-file/fonts/${file}`, 'font/woff2')})`);

// 2. Logo, inlined so the default brand settings work without any server.
const logo = b64('public/brand/bnm-logo.png', 'image/png');

// 3. App bundle: the real pages and components, with `next/link` and `next/navigation` swapped for hash-router shims.
function resolveAlias(spec) {
  const base = rel(spec.replace(/^@\//, ''));
  for (const candidate of [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Cannot resolve ${spec}`);
}
const result = await build({
  entryPoints: [rel('single-file/entry.jsx')],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_LOGO_URL': JSON.stringify(logo),
  },
  logLevel: 'error',
  plugins: [{
    name: 'next-shims',
    setup(b) {
      b.onResolve({ filter: /^next\/link$/ }, () => ({ path: rel('single-file/shims/link.jsx') }));
      b.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: rel('single-file/shims/navigation.js') }));
      b.onResolve({ filter: /^@\// }, (args) => ({ path: resolveAlias(args.path) }));
    },
  }],
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

// 4. One HTML file.
const html = `<!doctype html>
<html lang="en" class="h-full antialiased">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Brainy Medic</title>
<meta name="description" content="Brainy Medic: the mentor-led 90-day practice challenge. Clickable UI prototype with sample data.">
<link rel="icon" href="${logo}">
<style>${fontCss}\n${appCss}</style>
</head>
<body class="min-h-full flex flex-col">
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;
// Same page as a fragment, for hosts that wrap the file in their own <html>/<head>/<body> (e.g. Claude artifacts).
const fragment = `<title>Brainy Medic</title>
<style>${fontCss}\n${appCss}</style>
<div id="root"></div>
<script>${js}</script>
`;
fs.mkdirSync(rel('dist'), { recursive: true });
const outFile = rel('dist/brainy-medic.html');
fs.writeFileSync(outFile, html);
fs.writeFileSync(rel('dist/brainy-medic.artifact.html'), fragment);
console.log(`Wrote ${path.relative(root, outFile)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB; js ${(Buffer.byteLength(js) / 1024).toFixed(0)} KB, css ${(Buffer.byteLength(appCss) / 1024).toFixed(0)} KB, fonts ${(Buffer.byteLength(fontCss) / 1024).toFixed(0)} KB)`);
