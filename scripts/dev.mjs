import http from 'node:http';
import {readFile, writeFile, rename} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {build,root} from './build.mjs';
import {render,validate} from './render.mjs';

await build();
const token = randomBytes(24).toString('hex');
const port = Number(process.env.PORT || 4173);
const origin = `http://127.0.0.1:${port}`;
const profilePath = new URL('content/profile.json',root);
let saving = false;
const server = http.createServer(async(req,res)=>{
  const send = (status,body,type='text/plain; charset=utf-8') => {res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);};
  try {
    if (req.headers.host !== `127.0.0.1:${port}`) return send(403,'Invalid host.');
    const path = new URL(req.url,origin).pathname;
    if (req.method==='GET') {
      if(path==='/api/profile') return send(200,await readFile(profilePath),'application/json');
      if(path==='/edit' || path==='/edit/') return send(200,(await readFile(new URL('editor/index.html',root),'utf8')).replace('__EDITOR_TOKEN__',token),'text/html; charset=utf-8');
      const files = {'/':'docs/index.html','/index.html':'docs/index.html','/style.css':'docs/style.css','/editor.js':'editor/editor.js','/editor.css':'editor/editor.css'};
      if(!files[path]) return send(404,'Not found.');
      const type = path.endsWith('.css')?'text/css; charset=utf-8':path.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8';
      return send(200,await readFile(new URL(files[path],root)),type);
    }
    if(req.method!=='POST' || !['/api/preview','/api/save'].includes(path)) return send(405,'Method not allowed.');
    if(req.headers.origin!==origin || req.headers['x-editor-token']!==token) return send(403,'Reload the editor before saving.');
    let body='';
    for await (const chunk of req) {body+=chunk;if(Buffer.byteLength(body)>100000) return send(413,'Profile is too large.');}
    const data=validate(JSON.parse(body));
    if(path==='/api/preview') return send(200,render(data).replace('<head>','<head><base href="/">'),'text/html; charset=utf-8');
    if(saving) return send(409,'Another save is in progress. Try again.');
    saving=true;
    try {
      const temporary = new URL('content/profile.json.tmp',root);
      await writeFile(temporary,JSON.stringify(data,null,2)+'\n');
      await rename(temporary,profilePath);
      await build(data);
      return send(200,JSON.stringify({saved:true}),'application/json');
    } finally {saving=false;}
  } catch(error) {return send(400,error.message);}
});
server.listen(port,'127.0.0.1',()=>console.log(`Preview: ${origin}\nLive editor: ${origin}/edit`));
