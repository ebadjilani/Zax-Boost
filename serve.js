const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4'};
http.createServer((q,s)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(__dirname,p);
fs.stat(f,(e,st)=>{if(e){s.writeHead(404);return s.end('404')}const t=T[path.extname(f)]||'application/octet-stream';
const r=q.headers.range;if(r&&t==='video/mp4'){const[a,b]=r.replace('bytes=','').split('-');const st0=+a,en=b?+b:st.size-1;s.writeHead(206,{'Content-Type':t,'Content-Range':`bytes ${st0}-${en}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':en-st0+1});return fs.createReadStream(f,{start:st0,end:en}).pipe(s)}
s.writeHead(200,{'Content-Type':t,'Content-Length':st.size,'Accept-Ranges':'bytes'});fs.createReadStream(f).pipe(s)})}).listen(5173);
