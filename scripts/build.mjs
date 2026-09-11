import {readFile,writeFile} from 'node:fs/promises';
import {render} from './render.mjs';
export const root = new URL('../', import.meta.url);
export async function build(profile) {
  const data = profile ?? JSON.parse(await readFile(new URL('content/profile.json',root),'utf8'));
  const html = render(data);
  await writeFile(new URL('docs/index.html',root), html);
  await writeFile(new URL('docs/.nojekyll',root), '');
  return html;
}
if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  await build(); console.log('Built docs/index.html — ready for GitHub Pages.');
}
