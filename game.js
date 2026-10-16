'use strict';
const $=id=>document.getElementById(id),nodes={},edges=[],lines=[];
function line(names,points,color){let ids=names.split(' ');ids.forEach((name,i)=>{if(!nodes[name])nodes[name]={name,x:points[i][0],y:points[i][1],neighbors:[],effect:0};if(i){let a=nodes[ids[i-1]],b=nodes[name];if(!a.neighbors.includes(name)){a.neighbors.push(name);b.neighbors.push(a.name);edges.push([a.name,name,color]);}}});lines.push({ids,color});}
const main='新宿 笹塚 代田橋 明大前 下高井戸 桜上水 上北沢 八幡山 芦花公園 千歳烏山 仙川 つつじヶ丘 柴崎 国領 布田 調布 西調布 飛田給 武蔵野台 多磨霊園 東府中 府中 分倍河原 中河原 聖蹟桜ヶ丘 百草園 高幡不動 南平 平山城址公園 長沼 北野 京王八王子'.split(' ');
line(main.join(' '),main.map((_,i)=>[160+i*105,600]),'#d72a86');
line('笹塚 幡ヶ谷 初台 新線新宿',[[265,600],[265,430],[160,350],[55,350]],'#c33a81');
let ino='渋谷 神泉 駒場東大前 池ノ上 下北沢 新代田 東松原 明大前 永福町 西永福 浜田山 高井戸 富士見ヶ丘 久我山 三鷹台 井の頭公園 吉祥寺'.split(' ');
line(ino.join(' '),ino.map((n,i)=>i<7?[475+(7-i)*95,600+(7-i)*85]:[475+(i-7)*100,600-(i-7)*105]),'#369cbd');
let saga='調布 京王多摩川 京王稲田堤 京王よみうりランド 稲城 若葉台 京王永山 京王多摩センター 京王堀之内 南大沢 多摩境 橋本'.split(' ');
line(saga.join(' '),saga.map((n,i)=>[1735+i*100,600+i*100]),'#a068ba');
line('東府中 府中競馬正門前',[[2260,600],[2260,820]],'#e99c38');
line('高幡不動 多摩動物公園',[[2890,600],[2890,840]],'#e99c38');
line('北野 京王片倉 山田 めじろ台 狭間 高尾 高尾山口',Array.from({length:7},(_,i)=>[3310+i*100,600+i*110]),'#df815b');
const goals=['新宿','新線新宿','吉祥寺','渋谷','橋本','府中競馬正門前','多摩動物公園','京王八王子','高尾山口'];
let mode='solo',positions=['新宿','新宿'],histories=[[],[]],turn=0,goal='',busy=true,round=0,counts=[0,0],session=0,zoom=.8,tx=0,ty=0,branchResolve=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),pick=a=>a[Math.floor(Math.random()*a.length)];
function shortest(a,b){let q=[[a]],seen=new Set([a]);while(q.length){let p=q.shift(),last=p.at(-1);if(last===b)return p;nodes[last].neighbors.forEach(n=>{if(!seen.has(n)){seen.add(n);q.push([...p,n]);}});}return [];}
function effects(){Object.values(nodes).forEach(n=>{let r=Math.random()*100;n.effect=r<25?0:r<55?1:r<65?3:r<85?-1:-2;});positions.forEach(p=>nodes[p].effect=0);nodes[goal].effect=0;}
function render(){let s='<svg width="4200" height="2600" viewBox="-100 -650 4200 2600" role="img" aria-label="京王線と井の頭線のすごろく路線図"><defs><pattern id="dots" width="35" height="35" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.3" fill="#d5e1d2"/></pattern></defs><rect x="-100" y="-650" width="4200" height="2600" fill="url(#dots)"/>';
for(const [a,b,c]of edges){const n=nodes[a],m=nodes[b];s+=`<path d="M${n.x} ${n.y}L${m.x} ${m.y}" stroke="white" stroke-width="20"/><path d="M${n.x} ${n.y}L${m.x} ${m.y}" stroke="${c}" stroke-width="12"/>`;}
const route=goal?shortest(positions[turn],goal):[];for(let i=1;i<route.length;i++){let a=nodes[route[i-1]],b=nodes[route[i]];s+=`<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#f5c74b" stroke-width="5" stroke-dasharray="8 9"/>`;}
s+='<text x="1200" y="470" font-size="26" fill="#ce347b" font-weight="800">京王線</text><text x="980" y="-240" font-size="26" fill="#298ba9" font-weight="800">井の頭線</text><text x="2310" y="1320" font-size="26" fill="#9460a7" font-weight="800">相模原線</text><text x="3560" y="720" font-size="26" fill="#c77553" font-weight="800">高尾線</text>';
Object.values(nodes).forEach(n=>{const g=n.name===goal,e=n.effect,occupied=positions.slice(0,mode==='cpu'?2:1).includes(n.name),fill=g?'#f6ca48':e>0?'#d5efdd':e<0?'#f9ded1':'#fffdf7';s+=`<circle cx="${n.x}" cy="${n.y}" r="${g?25:20}" fill="${fill}" stroke="${g?'#b38b15':'#75968a'}" stroke-width="3"/><text x="${n.x}" y="${n.y+6}" text-anchor="middle" font-size="16" font-weight="800" fill="${e<0?'#b95845':'#286650'}">${g?'★':e>0?'+'+e:e||'○'}</text><text x="${n.x}" y="${n.y-37}" transform="rotate(-28 ${n.x} ${n.y-37})" text-anchor="start" font-size="21" font-weight="${goals.includes(n.name)?800:600}" fill="#294b42" stroke="#eaf1e8" stroke-width="5" paint-order="stroke">${n.name}</text>`;});
positions.slice(0,mode==='cpu'?2:1).forEach((p,i)=>{let n=nodes[p],x=n.x+parkOffset(i,p);s+=`<g id="token-${i}" transform="translate(${x} ${n.y})"><ellipse id="shadow-${i}" cx="0" cy="20" rx="22" ry="6" fill="#244c42" opacity=".22"/><g id="vehicle-${i}"><rect x="-22" y="-26" width="44" height="44" rx="12" fill="${i?'#d7813d':'#176f55'}" stroke="white" stroke-width="3"/><text x="0" y="6" text-anchor="middle" font-size="30">${i?'🤖':'🚃'}</text></g></g>`;});
$('map').innerHTML=s+'</svg>';updateTransform();$('players').innerHTML=positions.slice(0,mode==='cpu'?2:1).map((p,i)=>`<div class="player ${turn===i?'active':''}"><span style="font-size:24px">${i?'🤖':'🚃'}</span><div>${i?'コンピューター':'あなた'} <b>${p}</b></div><span style="margin-left:auto;font-size:11px">🏁 ${counts[i]}</span></div>`).join('');}
function updateTransform(){$('map').style.transform=`translate(${tx}px,${ty}px) scale(${zoom})`;}
function center(p=positions[turn]){let n=nodes[p],r=$('board').getBoundingClientRect();tx=r.width/2-(n.x+100)*zoom;ty=r.height*.53-(n.y+650)*zoom;updateTransform();}
function modal(html){$('card').innerHTML=html;$('overlay').hidden=false;}
function close(){$('overlay').hidden=true;}
function menu(){if(busy&&round)return;modal(`<div class="eyebrow">きょうは どこまで いこう？</div><div class="bigtrain">🚃</div><h2>でんしゃ すごろく</h2><p>サイコロをふって、えきから えきへ。<br>もくてきちを めざして しゅっぱつ！</p><button class="primary" id="solo">ひとりで あそぶ</button><button class="option" id="cpu">🤖 コンピューターと あそぶ</button>${round?'<button class="option" id="resume">つづける</button>':''}<p style="font-size:11px">おとなの方へ：分岐で行き先を選べます。<br>効果は止まった駅で1回だけ。CPUは分岐もランダムです。</p>`);$('solo').onclick=()=>start('solo');$('cpu').onclick=()=>start('cpu');if($('resume'))$('resume').onclick=close;}
async function start(m){session++;mode=m;positions=['新宿','新宿'];histories=[[],[]];turn=0;round=0;counts=[0,0];await nextGoal(true);}
async function nextGoal(first=false){busy=true;$('roll').disabled=true;round++;let candidates=goals.filter(n=>first?n!=='新宿':!positions.slice(0,mode==='cpu'?2:1).includes(n));goal=pick(candidates);modal('<div class="eyebrow">もくてきち ルーレット</div><div class="bigtrain">🎫</div><h2>つぎは どこかな？</h2><div class="lottery" id="lottery">…</div><p>わくわく、どきどき！</p>');for(let i=0;i<19;i++){$('lottery').textContent=pick(candidates);await sleep(65+i*6);}$('lottery').textContent=goal;$('card').insertAdjacentHTML('beforeend','<span class="chip">もくてきちが きまったよ！</span><button class="primary" id="depart">しゅっぱつ！ →</button>');$('dest').textContent=goal;effects();render();center();await new Promise(r=>$('depart').onclick=r);close();busy=false;setTurn();}
function setTurn(){render();center();$('status').textContent=turn?'コンピューターの ばんだよ':'あなたの ばんだよ！';$('rollLabel').textContent=turn?'コンピューターの ばん':'サイコロを ふる';$('roll').disabled=busy||turn===1;if(turn===1)setTimeout(()=>roll(),1000);}
async function choose(options){
if(turn===1)return pick(options);if(options.length===1)return options[0];
const branch=$('branch');
branch.innerHTML=`<h2>🚦 どっちに いこう？</h2><p class="branch-goal">もくてきち：<strong>🏁 ${goal}</strong></p><div class="branch-views"><button id="branchGoal">🏁 もくてきちを みる</button><button id="branchHere">🚃 いまの えきに もどる</button></div><div class="branch-options">`+options.map((n,i)=>`<button class="${shortest(n,goal).length===Math.min(...options.map(o=>shortest(o,goal).length))?'primary':'option'}" data-choice="${i}">${n} ほうめん →</button>`).join('')+'</div>';
branch.hidden=false;$('panel').classList.add('choosing');center();
$('branchGoal').onclick=()=>center(goal);$('branchHere').onclick=()=>center(positions[turn]);
try{return await new Promise(resolve=>{branchResolve=resolve;branch.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>resolve(options[+b.dataset.choice]));});}
finally{branchResolve=null;branch.hidden=true;branch.innerHTML='';$('panel').classList.remove('choosing');}
}
function parkOffset(player,station){return mode==='cpu'&&positions[1-player]===station?(player?19:-19):0;}
function travelPose(from,to,t,jump=false){
const progress=t*t*(3-2*t);
return {x:from.x+(to.x-from.x)*progress,y:from.y+(to.y-from.y)*progress,
height:jump?Math.sin(Math.PI*t)*72:Math.sin(Math.PI*t*6)*1.4*Math.sin(Math.PI*t),progress};
}
function animateTravel(fromName,toName,jump=false){
const player=turn,from=nodes[fromName],to=nodes[toName],token=$('token-'+player),vehicle=$('vehicle-'+player),shadow=$('shadow-'+player);
// Each animation follows one actual track segment. Commit the station only on arrival.
center(fromName);const startTx=tx,startTy=ty,rect=$('board').getBoundingClientRect();
const targetTx=rect.width/2-(to.x+100)*zoom,targetTy=rect.height*.53-(to.y+650)*zoom;
const fromOffset=parkOffset(player,fromName),toOffset=parkOffset(player,toName),duration=jump?650:520;
return new Promise(resolve=>{let started=null;
function frame(now){if(started===null)started=now;const t=Math.min(1,(now-started)/duration),pose=travelPose(from,to,t,jump);
const offset=fromOffset+(toOffset-fromOffset)*pose.progress;
token.setAttribute('transform',`translate(${pose.x+offset} ${pose.y})`);
vehicle.setAttribute('transform',`translate(0 ${-pose.height}) rotate(${jump?Math.sin(Math.PI*t*2)*7:0})`);
shadow.setAttribute('rx',22-(jump?10*Math.sin(Math.PI*t):0));shadow.setAttribute('opacity',jump?.22-.12*Math.sin(Math.PI*t):.22);
tx=startTx+(targetTx-startTx)*pose.progress;ty=startTy+(targetTy-startTy)*pose.progress;updateTransform();
if(t<1)requestAnimationFrame(frame);else resolve();}
requestAnimationFrame(frame);
});
}
async function move(steps,back=false,jump=false){for(let i=0;i<steps;i++){let p=positions[turn],next;if(back){next=histories[turn].pop();if(!next)break;}else{let prev=histories[turn].at(-1);let options=nodes[p].neighbors.filter(n=>n!==prev);if(!options.length)options=nodes[p].neighbors;next=await choose(options);histories[turn].push(p);}await animateTravel(p,next,jump);positions[turn]=next;render();if(next===goal)return true;if(jump)await sleep(100);}return false;}
function celebrate(){const c=$('confetti');c.innerHTML='';for(let i=0;i<100;i++){let e=document.createElement('i');e.style.cssText=`left:${Math.random()*100}%;background:${pick(['#f5cc49','#d93086','#358fce','#46ae78','#b175ce'])};animation-delay:${Math.random()*1.2}s;--drift:${Math.random()*300-150}px`;c.appendChild(e);}setTimeout(()=>c.innerHTML='',5000);}
async function win(){counts[turn]++;celebrate();modal(`<div class="bigtrain">🎉</div><div class="eyebrow">${goal} に とうちゃく！</div><h2>おめでとう！</h2><p>${turn?'コンピューター':'あなた'}が ゴールしたよ！<br>つぎの たびに でかけよう！</p><button class="primary" id="next">つぎの もくてきちへ →</button>`);await new Promise(r=>$('next').onclick=r);turn=0;await nextGoal();}
async function roll(){if(busy)return;busy=true;$('roll').disabled=true;$('die').classList.add('shake');$('status').textContent='ころころ… なにが でるかな？';for(let i=0;i<14;i++){$('die').textContent=pick(['⚀','⚁','⚂','⚃','⚄','⚅']);await sleep(65);}let value=1+Math.floor(Math.random()*6);$('die').classList.remove('shake');$('die').textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][value-1];$('status').textContent=value+'！ '+value+'えき すすむよ';await sleep(550);if(await move(value)){await win();return;}let effect=nodes[positions[turn]].effect;if(effect){$('status').textContent=positions[turn]+'：'+Math.abs(effect)+'えき '+(effect>0?'すすむ！':'もどる！');await sleep(850);if(await move(Math.abs(effect),effect<0,true)){await win();return;}}else{$('status').textContent=positions[turn]+'で ひとやすみ';await sleep(650);}busy=false;if(mode==='cpu')turn=1-turn;setTurn();}
$('roll').onclick=roll;$('menu').onclick=menu;$('locate').onclick=()=>center(positions[0]);$('goalView').onclick=()=>{if(goal)center(goal);};function scale(f){let r=$('board').getBoundingClientRect(),z=Math.max(.18,Math.min(1.6,zoom*f)),k=z/zoom;tx=r.width/2-(r.width/2-tx)*k;ty=r.height/2-(r.height/2-ty)*k;zoom=z;updateTransform();}$('plus').onclick=()=>scale(1.3);$('minus').onclick=()=>scale(1/1.3);
let pointers=new Map(),lastPinch=0;$('board').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;$('board').setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPinch=0;});$('board').addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;let old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){tx+=e.clientX-old.x;ty+=e.clientY-old.y;updateTransform();}else{let [a,b]=[...pointers.values()],dist=Math.hypot(a.x-b.x,a.y-b.y);if(lastPinch)scale(dist/lastPinch);lastPinch=dist;}});for(let ev of ['pointerup','pointercancel'])$('board').addEventListener(ev,e=>{pointers.delete(e.pointerId);lastPinch=0;});window.addEventListener('resize',()=>center());render();center();menu();
