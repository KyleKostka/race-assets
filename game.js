import*as e from"three";import{GLTFLoader as Tt}from"three/examples/jsm/loaders/GLTFLoader.js";import{MeshoptDecoder as xt}from"three/examples/jsm/libs/meshopt_decoder.module.js";import{RoomEnvironment as RE2}from"three/examples/jsm/environments/RoomEnvironment.js";import{buildPitLane as PLB,animatePitCrew as PLA}from"./pit.js";var PITLEN=400,PITSPD=18;var Y=new URLSearchParams(location.search).get("assets")||"";function $(n){return function(){n|=0,n=n+1831565813|0;let t=Math.imul(n^n>>>15,1|n);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function ft(n,t){let o=n.slice();for(let s=o.length-1;s>0;s--){let r=Math.floor(t()*(s+1));[o[s],o[r]]=[o[r],o[s]]}return o}var DN={SEN:"12",PRO:"2",MSC:"1",LAU:"12",HAM:"44",VER:"33",VET:"5",AND:"5",ALO:"14",MAN:"5"},DA={SEN:16777215,PRO:16719904,MSC:16777215,LAU:16777215,HAM:4251856,VER:16744192,VET:16766720,AND:13872981,ALO:16766720,MAN:14371620};function mkDecal(n){let t=DN[n.tag]||"",o=document.createElement("canvas");o.width=512;o.height=160;let s2=o.getContext("2d");s2.clearRect(0,0,512,160);s2.fillStyle="#"+(DA[n.tag]||16777215).toString(16).padStart(6,"0");s2.font="900 120px Arial";s2.textBaseline="middle";s2.fillText(t,18,80);s2.font="700 46px Arial";s2.fillText(n.name.toUpperCase(),18+s2.measureText(t).width+120,80);let r=new e.CanvasTexture(o);r.colorSpace=e.SRGBColorSpace;return r}var q=[{tag:"SEN",name:"Senna",color:16238100},{tag:"PRO",name:"Prost",color:16777215,keepLivery:!0},{tag:"MSC",name:"Schumacher",color:14417920},{tag:"LAU",name:"Lauda",color:10555922},{tag:"HAM",name:"Hamilton",color:13094358},{tag:"VER",name:"Verstappen",color:1450575},{tag:"VET",name:"Vettel",color:1714794},{tag:"AND",name:"Andretti",color:9071902},{tag:"ALO",name:"Alonso",color:1006768},{tag:"MAN",name:"Mansell",color:15922424}],S=q.length,W=new e.Vector3(0,1,0),y=3e3;function mt(n,t=.35){let o=n.map(m=>new e.Vector3(m[0],m[1],m[2])),s=new e.CatmullRomCurve3(o,!0,"centripetal",t),r=[],i=[];for(let m=0;m<y;m++){let E=m/y;r.push(s.getPointAt(E)),i.push(s.getTangentAt(E).normalize())}let l=s.getLength(),c=l/y,a=new Float32Array(y);for(let m=0;m<y;m++){let E=r[(m-2+y)%y],f=r[m],h=r[(m+2)%y],T=E.distanceTo(f),H=f.distanceTo(h),V=h.distanceTo(E),k=Math.abs((f.x-E.x)*(h.z-E.z)-(f.z-E.z)*(h.x-E.x));a[m]=2*k/(T*H*V+1e-9)}for(let m=0;m<2;m++){let E=new Float32Array(y);for(let f=0;f<y;f++)E[f]=(a[(f-1+y)%y]+a[f]*2+a[(f+1)%y])/4;a.set(E)}let d=new Float32Array(y),u=26,g=15,A=9,w=88,x=11;for(let m=0;m<y;m++)d[m]=Math.min(w,Math.max(x,Math.sqrt(u/Math.max(a[m],1e-5))));for(let m=0;m<2;m++){for(let E=y*2-1;E>=0;E--){let f=E%y,h=(E+1)%y;d[f]=Math.min(d[f],Math.sqrt(d[h]*d[h]+2*g*c))}for(let E=0;E<y*2;E++){let f=E%y,h=(E-1+y)%y;d[f]=Math.min(d[f],Math.sqrt(d[h]*d[h]+2*A*c))}}let R=m=>(m=(m%l+l)%l,m/c);return{pts:r,tans:i,LAP:l,ds:c,kappa:a,speed:d,posAt(m,E){let f=R(m),h=Math.floor(f)%y,T=(h+1)%y,H=f-Math.floor(f);return E.copy(r[h]).lerp(r[T],H)},tanAt(m,E){let f=R(m),h=Math.floor(f)%y,T=(h+1)%y,H=f-Math.floor(f);return E.copy(i[h]).lerp(i[T],H).normalize()},speedAt(m){let E=R(m),f=Math.floor(E)%y,h=(f+1)%y,T=E-Math.floor(E);return d[f]*(1-T)+d[h]*T},sNear(m){let E=0,f=1e9;for(let h=0;h<y;h++){let T=r[h].distanceToSquared(m);T<f&&(f=T,E=h)}return E*c}}}var Rt=document.getElementById("gl"),j=new e.WebGLRenderer({canvas:Rt,antialias:!0});j.setPixelRatio(Math.min(devicePixelRatio,2));j.outputColorSpace=e.SRGBColorSpace;j.toneMapping=e.ACESFilmicToneMapping;j.toneMappingExposure=.92;j.shadowMap.enabled=!0;j.shadowMap.type=e.PCFSoftShadowMap;var B=new e.Scene,G=new e.PerspectiveCamera(58,1,.5,6e3);var HEMI=new e.HemisphereLight(13624565,5264990,.75);B.add(HEMI);var Et=new e.DirectionalLight(16773853,1.15);Et.position.set(-300,420,180);Et.castShadow=!0;Et.shadow.mapSize.set(2048,2048);Et.shadow.camera.left=-150;Et.shadow.camera.right=150;Et.shadow.camera.top=150;Et.shadow.camera.bottom=-150;Et.shadow.camera.near=40;Et.shadow.camera.far=1100;Et.shadow.bias=-45e-5;B.add(Et);B.add(Et.target);{let pm=new e.PMREMGenerator(j);B.environment=pm.fromScene(new RE2,.02).texture}var SKD=new e.Mesh(new e.SphereGeometry(4200,16,12),new e.ShaderMaterial({side:e.BackSide,depthWrite:!1,fog:!1,uniforms:{c1:{value:new e.Color(11061472)},c2:{value:new e.Color(16775920)}},vertexShader:"varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"varying vec3 vP;uniform vec3 c1;uniform vec3 c2;void main(){float h=clamp(normalize(vP).y*.5+.5,0.,1.);gl_FragColor=vec4(mix(c2,c1,pow(h,.55)),1.);}"}));B.add(SKD);function pt(){j.setSize(innerWidth,innerHeight,!1),G.aspect=innerWidth/innerHeight,G.updateProjectionMatrix()}addEventListener("resize",pt);pt();function D(n,t,o,s,r,i=1,l=0,c=null){c===null&&(c=n.LAP);let a=[],d=[],u=[],g=Math.floor(l/n.ds),A=Math.ceil(c/n.ds),w=0;for(let R=g;R<=A;R+=i){let m=(R%y+y)%y,E=n.pts[m],f=n.tans[m],h=new e.Vector3().crossVectors(f,W).normalize(),T=E.clone().addScaledVector(h,t);T.y+=s;let H=E.clone().addScaledVector(h,o);H.y+=s,a.push(T.x,T.y,T.z,H.x,H.y,H.z),u.push(0,1,0,0,1,0),R>g&&d.push(w-2,w-1,w,w,w-1,w+1),w+=2}let x=new e.BufferGeometry;return x.setAttribute("position",new e.Float32BufferAttribute(a,3)),x.setAttribute("normal",new e.Float32BufferAttribute(u,3)),x.setIndex(d),new e.Mesh(x,new e.MeshLambertMaterial({color:r}))}function ut(n,t,o,s){let r=new e.Vector3;n.posAt(t,r);let i=new e.Vector3;n.tanAt(t,i);let l=new e.Vector3().crossVectors(i,W).normalize(),c=document.createElement("canvas");c.width=64,c.height=8;let a=c.getContext("2d");for(let u=0;u<8;u++)a.fillStyle=u%2?"#111":"#eee",a.fillRect(u*8,0,8,8);let d=new e.Mesh(new e.PlaneGeometry(10.4,2.4),new e.MeshBasicMaterial({map:new e.CanvasTexture(c)}));if(d.rotation.x=-Math.PI/2,d.position.copy(r),d.position.y+=.06,d.rotation.z=Math.atan2(i.x,i.z),o.add(d),s){let u=new e.MeshLambertMaterial({color:2237484});for(let A of[-1,1]){let w=new e.Mesh(new e.BoxGeometry(.5,7,.5),u);w.position.copy(r).addScaledVector(l,A*7.4),w.position.y+=3.5,o.add(w)}let g=new e.Mesh(new e.BoxGeometry(.6,1.4,14.8),u);g.position.copy(r),g.position.y+=6.6,g.rotation.y=Math.atan2(i.x,i.z),o.add(g)}}var Ht=[[-100,-30,1],[-60,-14,1.5],[-5,8,2.5],[45,25,4],[68,45,6.5],[74,90,14],[86,150,24],[92,205,30],[72,242,32],[34,252,32.5],[2,240,31],[-20,212,26],[-30,182,21],[-52,163,17.5],[-74,152,15.5],[-86,140,14.5],[-80,126,13.5],[-62,118,12],[-32,112,10],[-4,110,7],[50,104,5],[108,92,4],[152,64,3],[175,22,2],[180,-14,1],[168,-34,.8],[143,-46,.8],[108,-56,.8],[66,-60,.8],[36,-72,.8],[2,-76,.8],[-34,-68,.8],[-66,-62,.9],[-88,-52,1],[-96,-38,1]];function At(){let t=mt(Ht.map(c=>[c[0]*2.35,c[2],c[1]*2.35])),o=new e.Group,s=5.2;o.add(D(t,-s,s,0,3816772,2)),o.add(D(t,-s-.45,-s+.05,.02,15263982,2)),o.add(D(t,s-.05,s+.45,.02,15263982,2));{let a=null;for(let d=0;d<=y;d++){let u=d%y,g=t.kappa[u]>.016;g&&a===null&&(a=d),(!g||d===y)&&a!==null&&((d-a)*t.ds>14&&(o.add(D(t,-s-1.15,-s-.2,.05,14169391,2,a*t.ds,d*t.ds)),o.add(D(t,s+.2,s+1.15,.05,14169391,2,a*t.ds,d*t.ds))),a=null)}}for(let c of[-s-1.9,s+1.9]){let a=D(t,c-.18,c+.18,0,12173516,3),d=a.geometry.attributes.position;for(let u=0;u<d.count;u++)d.setY(u,d.getY(u)+.55);o.add(a)}let r=t.sNear(new e.Vector3(-60*2.35,1.5,-14*2.35));ut(t,r,o,!0);let i=t.sNear(new e.Vector3(-4*2.35,7,110*2.35))+30,l=t.sNear(new e.Vector3(175*2.35,2,22*2.35))-20;{let c=new e.MeshLambertMaterial({color:6116167}),a=14;for(let d=i;d<l;d+=a){let u=new e.Vector3;t.posAt(d,u);let g=new e.Vector3;t.tanAt(d,g);let A=new e.Vector3().crossVectors(g,W).normalize(),w=Math.atan2(g.x,g.z),x=new e.Mesh(new e.BoxGeometry((s+2.6)*2,1.2,a+1.5),c);x.position.copy(u),x.position.y+=7.2,x.rotation.y=w,o.add(x);for(let R of[-1,1]){let m=new e.Mesh(new e.BoxGeometry(1,7.4,a+1.5),c);m.position.copy(u).addScaledVector(A,R*(s+2.3)),m.position.y+=3.7,m.rotation.y=w,o.add(m)}}for(let d=i+20;d<l;d+=90){let u=new e.Vector3;t.posAt(d,u);let g=new e.PointLight(16757355,45,90,1.8);g.position.copy(u),g.position.y+=5.6,o.add(g)}}{let c=new e.Mesh(new e.PlaneGeometry(760,420),new e.MeshLambertMaterial({color:3043230}));c.rotation.x=-Math.PI/2,c.position.set(56,-.4,-280),o.add(c);let a=$(7);for(let d=0;d<14;d++){let u=new e.Mesh(new e.BoxGeometry(8+a()*16,3,4+a()*3),new e.MeshLambertMaterial({color:16054010}));u.position.set(-150+a()*520,1.1,-300-a()*140),u.rotation.y=a()*Math.PI,o.add(u)}}{let c=$(42),a=[15326411,15786710,14668480,14995396,14273464,15722200,15127482],d=[],u=0,g=0,A=(x,R,m)=>{for(let E=0;E<y;E+=10){let f=t.pts[E],h=f.x-x,T=f.z-R;if(h*h+T*T<m*m)return!1}return!0};for(;u<160&&g<4e3;){g++;let x=Math.floor(c()*y),R=t.pts[x],m=t.tans[x],E=new e.Vector3().crossVectors(m,W).normalize(),f=c()<.5?-1:1,h=27+c()*70,T=R.x+E.x*f*h,H=R.z+E.z*f*h;if(H<-140)continue;let V=10+c()*18,k=10+c()*18,P=Math.max(V,k)*.8+9;if(!A(T,H,P))continue;let K=!0;for(let X of d){let at=X.x-T,ct=X.z-H;if(at*at+ct*ct<(X.r+Math.max(V,k)/2)**2){K=!1;break}}if(!K)continue;let z=12+c()*30+R.y*.8,I=new e.Mesh(new e.BoxGeometry(V,z,k),new e.MeshLambertMaterial({color:a[Math.floor(c()*a.length)]}));I.position.set(T,R.y*.6+z/2-2,H),I.rotation.y=c()*.6-.3,o.add(I),d.push({x:T,z:H,r:Math.max(V,k)/2}),u++}let w=new e.Mesh(new e.PlaneGeometry(3200,3200),new e.MeshLambertMaterial({color:10133646}));w.rotation.x=-Math.PI/2,w.position.y=-.6,o.add(w)}return{geom:t,group:o,sFinish:r,tunnel:[i,l],yLift:0,sky:10470365,fog:[420,1600],camFar:3e3,label:"MONACO",credit:null}}var ot=new Tt;ot.setMeshoptDecoder(xt);async function bt(){let n=await(await fetch(Y+"suzuka_line.json")).json(),t=await ot.loadAsync(Y+"suzuka.glb"),o=mt(n.points,.5),s=new e.Group;s.add(t.scene);let r=new e.Mesh(new e.PlaneGeometry(8e3,8e3),new e.MeshLambertMaterial({color:9412734}));return r.rotation.x=-Math.PI/2,r.position.y=-28,s.add(r),ut(o,0,s,!1),{geom:o,group:s,sFinish:0,tunnel:null,yLift:.25,sky:11061472,fog:[600,3400],camFar:6e3,label:"SUZUKA",credit:'"Suzuka Circuit 2001 layout" by Dave Love SketchFab (CC-BY)'}}async function realTrack(k,meta){let n=await(await fetch(Y+"tracks/"+k+"_line.json")).json(),t=mt(n.points,.5),g=await ot.loadAsync(Y+"tracks/"+k+".glb"),grp=new e.Group,inner=g.scene;inner.scale.setScalar(n.modelScale||1);inner.position.y=-(n.yShift||0);inner.traverse(q=>{if(q.isMesh){q.receiveShadow=!0;let ms=Array.isArray(q.material)?q.material:[q.material];ms.forEach(mm=>{mm.map&&(mm.map.colorSpace=e.SRGBColorSpace,mm.map.anisotropy=j.capabilities.getMaxAnisotropy());mm.metalness!==void 0&&(mm.metalness=Math.min(mm.metalness,.15));mm.roughness!==void 0&&(mm.roughness=Math.max(mm.roughness,.6));mm.side=e.DoubleSide;mm.transparent&&(mm.alphaTest=Math.max(mm.alphaTest||0,.4))})}});grp.add(inner);let gm=new e.Mesh(new e.PlaneGeometry(2e4,2e4),new e.MeshLambertMaterial({color:meta.ground||9412734}));return{geom:t,group:grp,sFinish:0,tunnel:null,yLift:.15,sky:meta.sky,fog:meta.fog,camFar:9e3,label:meta.label,credit:meta.credit||null}}
async function Ov(){let n=await(await fetch(Y+"tracks/oval_line.json")).json(),t=await ot.loadAsync(Y+"tracks/oval.glb"),o=mt(n.points,.5),s=new e.Group;s.add(t.scene);t.scene.traverse(q=>{if(q.isMesh){q.receiveShadow=!0;let ms=Array.isArray(q.material)?q.material:[q.material];q.material=ms.map(mm=>{let nm=new e.MeshLambertMaterial({color:16777215});if(mm.map){nm.map=mm.map;nm.map.colorSpace=e.SRGBColorSpace;nm.map.anisotropy=j.capabilities.getMaxAnisotropy();nm.map.wrapS=nm.map.wrapT=e.RepeatWrapping;nm.map.needsUpdate=!0}else nm.color.copy(mm.color||new e.Color(11184810));nm.transparent=!!mm.transparent;nm.alphaTest=mm.alphaTest||(mm.transparent?.35:0);nm.side=mm.side;return nm});ms.length===1&&(q.material=q.material[0])}});return{geom:o,group:s,sFinish:0,tunnel:null,yLift:.3,sky:11724767,fog:[700,2600],camFar:4e3,label:"OVAL",credit:'Track: RCC Design "Cartoon Race Track - Oval" (Fab)'}}
var TRK={suzuka:{label:"SUZUKA",sky:11061472,fog:[800,4600]},monza:{label:"MONZA",sky:11061472,fog:[900,5200]},spa:{label:"SPA",sky:10998015,fog:[800,4600]},imola:{label:"IMOLA",sky:11061472,fog:[700,4200]},silverstone:{label:"SILVERSTONE",sky:11061472,fog:[900,5e3]},barcelona:{label:"BARCELONA",sky:11061472,fog:[900,5e3]},singapore:{label:"SINGAPORE",sky:2308674,fog:[500,3200],night:!0},nurburgring:{label:"NÜRBURGRING",sky:10860236,fog:[800,4600]},shanghai:{label:"SHANGHAI",sky:11061472,fog:[900,5e3]}};
var St={suzuka:bt,oval:Ov},Z={},M=null,O=null;for(let k9 of Object.keys(TRK))St[k9]=()=>realTrack(k9,TRK[k9]);async function ht(n){if(O!==n&&!Z[n]){try{Z[n]=await St[n]()}catch(err){console.warn("track load failed",n,err);let ld=document.getElementById("loading");ld.style.display="flex";ld.innerHTML='<div style="text-align:center;line-height:1.7"><div style="color:#ff9c9c">COULD NOT LOAD '+n.toUpperCase()+'</div><div style="font-size:11px;letter-spacing:.08em;color:#8a93a6">that circuit&rsquo;s mesh isn&rsquo;t on the server yet &mdash; pick another track</div></div>';let q=document.getElementById("trackSel");q&&(q.value=O||"suzuka");p.running=!1;p.phase="idle";throw err}}O!==n&&(M&&B.remove(M.group),M=Z[n],O=n,B.add(M.group),M.group.traverse(q=>{q.isMesh&&(q.receiveShadow=!0)}),B.background=new e.Color(M.sky),SKD.material.uniforms.c1.value.setHex(M.sky),SKD.material.uniforms.c2.value.copy(new e.Color(M.sky).lerp(new e.Color(16775920),.55)),B.fog=new e.Fog(M.sky,M.fog[0],M.fog[1]),G.far=M.camFar,G.updateProjectionMatrix(),nightMode(!!M.night),Bt(),vt(),mkPit(),document.getElementById("trackname").textContent=M.label,document.getElementById("credit").textContent=(M.credit?M.credit+" \xB7 ":"")+'Wheel by OscarContrerasLithgow SketchFab (CC-BY)',(()=>{let q=document.getElementById("trackSel");q&&(q.value=n)})())}function mkPit(){if(!M||M.pit)return;try{
M.pit=PLB(e,M.geom,{entryS:0,exitS:PITLEN,side:-1,offset:15,laneWidth:11,boxes:S,taper:70,yLift:M.yLift+.05,speedLimit:65});
M.group.add(M.pit.group)}catch(err){console.warn("pit lane failed",err);M.pit=null}}
function kt(n){let t=new e.Group,o=new e.MeshStandardMaterial({color:n,metalness:.35,roughness:.42}),s=new e.Mesh(new e.BoxGeometry(1.6,.6,4.4),o);return s.position.y=.5,t.add(s),t}var J=null,tt={},wh=null,JM={},CM={SEN:"cars/senna.glb",PRO:"cars/prost.glb",MSC:"cars/schumacher.glb",LAU:"cars/lauda.glb",HAM:"cars/lewis.glb",VER:"cars/verstappen.glb",VET:"cars/vettel.glb",AND:"cars/andretti.glb",ALO:"cars/alonso.glb",MAN:"cars/mansell.glb"},CF={ALO:Math.PI};function Cw(t,fl){let o=new e.Box3().setFromObject(t),s=o.getSize(new e.Vector3),r=new e.Group;r.add(t);let i=fl||0;s.x>s.z?r.rotation.y=Math.PI/2+i:r.rotation.y=i;let l=new e.Group;l.add(r);l.updateMatrixWorld(!0);o=new e.Box3().setFromObject(l);s=o.getSize(new e.Vector3);l.scale.setScalar(4.9/s.z);l.updateMatrixWorld(!0);o=new e.Box3().setFromObject(l);let c=o.getCenter(new e.Vector3);l.position.set(-c.x,-o.min.y,-c.z);let a=new e.Group;a.add(l);return a}async function C2(){await Promise.all(Object.keys(CM).map(async k=>{try{let t=(await ot.loadAsync(Y+CM[k])).scene;t.traverse(q=>{if(q.isMesh){q.castShadow=!0;let ms=Array.isArray(q.material)?q.material:[q.material];ms.forEach(mm=>{mm.map&&(mm.map.colorSpace=e.SRGBColorSpace,mm.map.anisotropy=j.capabilities.getMaxAnisotropy());mm.metalness=Math.min(mm.metalness===void 0?.25:mm.metalness,.35);mm.roughness=Math.max(mm.roughness===void 0?.45:mm.roughness,.35)})}});let wr=[];t.traverse(q=>{if(q.isMesh&&/wheel|tyre|tire|rim/i.test(q.name||"")){let bb=new e.Box3().setFromObject(q);wr.push(q)}});JM[k]=Cw(t,CF[k]||0);JM[k].userData.wheelNames=wr.map(q=>q.name)}catch(n){console.warn("car model failed",k,n)}}))}async function Uw(){try{let t=(await ot.loadAsync(Y+"wheel.glb")).scene,o=new e.Box3().setFromObject(t),s=o.getSize(new e.Vector3),c=o.getCenter(new e.Vector3);t.position.set(-c.x,-c.y,-c.z);let r=new e.Group;r.add(t),r.scale.setScalar(.44/s.x),r.position.set(0,-.34,-.62),r.visible=!1,wh=r,G.add(wh),B.add(G)}catch(n){console.warn("wheel failed",n)}}async function Lt(){let n=new e.TextureLoader;await Promise.all(q.filter(t=>!t.keepLivery).map(async t=>{try{let o=await n.loadAsync(Y+"livery_"+t.tag+".webp");o.flipY=!1,o.colorSpace=e.SRGBColorSpace,tt[t.tag]=o}catch{console.warn("livery failed",t.tag)}}))}async function Ct(){try{let t=(await ot.loadAsync(Y+"mclaren.glb")).scene,o=new e.Box3().setFromObject(t),s=o.getSize(new e.Vector3),r=new e.Group;r.add(t);let i=0;s.x>s.z?r.rotation.y=Math.PI/2+i:r.rotation.y=i;let l=new e.Group;l.add(r),l.updateMatrixWorld(!0),o=new e.Box3().setFromObject(l),s=o.getSize(new e.Vector3),l.scale.setScalar(4.9/s.z),l.updateMatrixWorld(!0),o=new e.Box3().setFromObject(l);let c=o.getCenter(new e.Vector3);l.position.set(-c.x,-o.min.y,-c.z);let a=new e.Group;a.add(l),J=a}catch(n){console.warn("car GLB failed, using fallback",n),J=null}}function Vt(n){let t;JM[n.tag]?t=JM[n.tag].clone(!0):J?(t=J.clone(!0),t.traverse(s=>{if(s.isMesh){let i=(Array.isArray(s.material)?s.material:[s.material]).map(l=>{let c=l.clone();return!n.keepLivery&&l.name==="body_mat"&&(tt[n.tag]?(c.map=tt[n.tag],c.color.setHex(16777215)):(c.map=null,c.color.setHex(n.color),c.metalness=.45,c.roughness=.38)),c});s.material=Array.isArray(s.material)?i:i[0]}})):t=kt(n.color);t.traverse(q=>{q.isMesh&&(q.castShadow=!0)});if(JM[n.tag]&&JM[n.tag].userData.wheelNames){let wn=JM[n.tag].userData.wheelNames,ws=[];t.traverse(q=>{q.isMesh&&wn.indexOf(q.name)>=0&&ws.push(q)});t.userData.wheels=ws}let o=new e.Mesh(new e.CircleGeometry(1.9,18),new e.MeshBasicMaterial({color:0,transparent:!0,opacity:.18,depthWrite:!1}));o.rotation.x=-Math.PI/2,o.position.y=.03,o.scale.set(.75,1.25,1),t.add(o);return t}var b=[],p={running:!1,t:0,order:null,seed:0,laps:1,T:0,Warr:null,WDT:1/60,offsets:null,grid:null,timeScale:1,phase:"idle"},st=[],_=null,et=0;var QUAL={active:!1,t:0,result:null,consume:!1,track:null,laps:13,rows:null,qrng:null,_auto:0};var SC={active:!1,used:!1,endLap:0,GAP:34};function zt({order:n,seed:t,laps:o}){let s=M.geom,i=$(t>>>0);p.order=n.slice(),p.seed=t,p.laps=o;
{let rt=[];for(let c=0;c<S;c++){let r0=.975+i()*.05;b[c].rating=r0;rt.push({c:c,v:r0+(i()-.5)*.06})}
rt.sort((x,y)=>y.v-x.v);p.grid=(QUAL.consume&&QUAL.result&&QUAL.result.length===S)?(QUAL.consume=!1,QUAL.result.slice()):rt.map(x=>x.c)}let est=0;for(let k=0;k<y;k++)est+=s.ds/s.speed[k];p.timeScale=Math.max(1,est/50);p.raceDist=o*s.LAP;p.comps=(function(L){var LF={S:.30,M:.52,H:.78},CL={S:"#ff5252",M:"#ffd24a",H:"#e8e8ee"},MU={S:1.045,M:1,H:.966},C={};for(var k9 in LF){var cl=Math.max(1,L*LF[k9]);C[k9]={m:MU[k9],w:.075/cl,cliff:cl,col:CL[k9],life:cl}}return C})(o);b.forEach((a,idx)=>{a.finished=!1;a.out=!1;a.crashing=0;a.ft=0;a.lat=0;a.lap=0;a.gridPos=p.grid.indexOf(idx);a.s=-(a.gridPos*8.5)-6;a.prevS=a.s;a.laneBias=(a.gridPos%2?1:-1)*(.5+a.gridPos/S*.5);a.pace=a.rating*(1-.0025*(.05*a.gridPos+1.9*Math.pow(Math.max(0,a.gridPos-5),1.5)));a.form=1+(i()-.5)*.02;a.big=i()<.05?1.06:1;a.wob=1;a.momT=0;a.stopW=.009;a.react=.5+i()*1.1;a.spd=0;let LFm={S:.30,M:.52,H:.78},lifeL=k9=>Math.max(1,Math.round(o*LFm[k9]));let two=i()<(o>=8?.5:.25),first=i()<.6?"S":"M",st1;if(two){let c2=i()<.5?"S":"M",c3=i()<.5?"M":"H",l1=Math.max(1,Math.min(Math.max(1,o-2),Math.round(lifeL(first)*(.75+i()*.45)))),l2=Math.max(l1+1,Math.min(Math.max(2,o-1),l1+Math.round(lifeL(c2)*(.75+i()*.45))));st1=[{lap:l1,c:c2},{lap:l2,c:c3}]}else{let c2=first==="S"?(i()<.6?"M":"H"):"H",l1=Math.max(1,Math.min(Math.max(1,o-1),Math.round(lifeL(first)*(.8+i()*.5))));st1=[{lap:l1,c:c2}]}a.comp=first;a.age=0;a.stops=st1;a.inPit=!1;a.pitEnd=0;a.newComp=first});let nc=(q=>q<.3?0:q<.7?1:2)(i());p.crashes=ft([...Array(S).keys()],i).slice(0,nc).map(v=>({car:v,at:(.2+i()*.65)*p.raceDist,done:!1}));SC.active=!1;SC.used=!1;(function(){var _sb=document.getElementById("scbanner");if(_sb)_sb.style.display="none"})();wt()}function Pt(n,t,o){let{fr:s,cpOff:r,jit:i}=p.offsets;t=Math.min(1,Math.max(0,t));let l=0;for(;l<s.length-2&&t>s[l+1];)l++;let c=(t-s[l])/(s[l+1]-s[l]),a=c*c*(3-2*c),d=r[l][n]*(1-a)+r[l+1][n]*a,u=i[n];return d+Math.sin(o*u.f+u.p)*u.a*(1-t)*(t>.02?1:t/.02)}function gt(n){let t=p.Warr,o=n/p.WDT,s=Math.min(t.length-2,Math.max(0,Math.floor(o)));return t[s]+(t[s+1]-t[s])*(o-s)}async function v(n={}){try{await ht(n.track||O||"suzuka")}catch(err){return null}document.getElementById("loading").style.display="none";let t=(n.seed??Math.floor(Math.random()*1e9))>>>0,o=$(t^2654435769),s=n.order??ft([...Array(S).keys()],o),r=n.laps??5;return et++,zt({order:s,seed:t,laps:r}),st=[],CMT.last={},FW.length=0,b.forEach(q=>{q._sp=0;q._so=0}),document.getElementById("ticker").style.display="none",setPause(!1),p.t=-4.4,p.running=!0,p.phase="betting",document.getElementById("results").style.display="none",document.getElementById("lapval").innerHTML=`1<small>/${r}</small>`,document.getElementById("racename").textContent="#"+String(t%1e4).padStart(4,"0"),_={order:s,seed:t,laps:r,track:O},{order:s,seed:t,laps:r,track:O}}var rt=document.getElementById("towerrows"),nt=[],it=new Array(S).fill(0),yt=[...Array(S).keys()];function wt(){rt.innerHTML="",nt=[];for(let n=0;n<S;n++){let t=document.createElement("div");t.className="row",t.innerHTML=`<span class="pos">${n+1}</span><span class="chip"></span><span class="tag"></span><span class="tyre"></span><span class="gap"></span>`,rt.appendChild(t),nt.push(t)}}wt();var L=document.getElementById("map").getContext("2d"),N=[];function Bt(){let n=M.geom;N=[];let t=1e9,o=-1e9,s=1e9,r=-1e9;for(let l=0;l<y;l+=6){let c=n.pts[l];t=Math.min(t,c.x),o=Math.max(o,c.x),s=Math.min(s,c.z),r=Math.max(r,c.z)}let i=286/Math.max(o-t,r-s);for(let l=0;l<y;l+=6){let c=n.pts[l];N.push([(c.x-t)*i+(316-(o-t)*i)/2,316-((c.z-s)*i+(316-(r-s)*i)/2)])}}function It(){if(L.clearRect(0,0,316,316),!!N.length&&(L.beginPath(),N.forEach((n,t)=>t?L.lineTo(n[0],n[1]):L.moveTo(n[0],n[1])),L.closePath(),L.strokeStyle="rgba(255,255,255,.85)",L.lineWidth=5,L.lineJoin="round",L.stroke(),p.phase!=="idle"))for(let n of b){let t=Math.floor(((n.s+M.sFinish)%M.geom.LAP+M.geom.LAP)%M.geom.LAP/M.geom.ds/6),o=N[Math.min(t,N.length-1)];L.beginPath(),L.arc(o[0],o[1],5.5,0,7),L.fillStyle="#"+n.team.color.toString(16).padStart(6,"0"),L.fill(),L.lineWidth=1.5,L.strokeStyle="#0a0c12",L.stroke()}}var F=[];function vt(){let n=M.geom;F=[];for(let t=0;t<n.LAP;t+=Math.max(170,n.LAP/28)){if(M.tunnel&&t>M.tunnel[0]-40&&t<M.tunnel[1]+30)continue;let o=new e.Vector3;n.posAt(t,o);let s=new e.Vector3;n.tanAt(t,s);let r=new e.Vector3().crossVectors(s,W).normalize(),i=o.clone().addScaledVector(r,(F.length%2?1:-1)*11);i.y+=9+F.length%3*2.5,F.push({s:t,pos:i})}}var RAY=new e.Raycaster,RDOWN=new e.Vector3(0,-1,0),rcTick=0;RAY.far=60;var C={mode:"CHASE",until:0,focus:0,pos:new e.Vector3(0,60,120),look:new e.Vector3},lt=$(1234);function Ft(){let n=b.map((r,i)=>({i,s:r.s,o:r.out||r.crashing>0})).filter(r=>!r.o).sort((r,i)=>i.s-r.s);if(!n.length)return 0;yt=n.map(r=>r.i);let t=-1,o=1e9;for(let r=0;r<Math.min(6,n.length-1);r++){let i=n[r].s-n[r+1].s;i<o&&i<28&&(o=i,t=r+1)}return n[0].s/(p.raceDist||1)>.9?n[0].i:t>=0?n[t].i:n[0].i}var FC={yaw:.6,pitch:.42,dist:70,tgt:new e.Vector3,lock:!0,init:!1,k:{},drag:0,lx:0,ly:0};
var CAMFOV={ONBOARD:66,HELMET:60,NOSE:82,REAR:70,CHASE:58,TRACKSIDE:44,HELI:52,FREE:58};
var SEATM={ONBOARD:1,HELMET:1,NOSE:1,REAR:1};
function dt(n){if(!M||!b.length)return;let t=M.geom,o=C.wall=(C.wall||0)+n;
if(CAM.focus>=0&&b[CAM.focus]&&!b[CAM.focus].out)C.focus=CAM.focus;
if(CAM.mode!=="AUTO"){C.mode=CAM.mode;CAM.focus<0&&CAM.mode!=="FREE"&&(C.focus=Ft());
document.getElementById("camlabel").textContent=CAM.mode+" \xB7 "+b[C.focus].team.tag+(CAM.mode==="FREE"&&FC.lock?" \xB7 LOCK":"")}
if(o>C.until){let g=lt();C.mode=g<.28?"CHASE":g<.48?"TRACKSIDE":g<.64?"HELI":g<.8?"ONBOARD":g<.92?"HELMET":"NOSE",
C.focus=SEATM[C.mode]?(q=>q[Math.floor(lt()*q.length)]||0)(b.map((q2,q3)=>q3).filter(q3=>!b[q3].out&&!b[q3].crashing)):Ft(),
C.until=o+5.5+lt()*3.5,
document.getElementById("camlabel").textContent="CAM \xB7 "+C.mode+" \xB7 "+b[C.focus].team.tag}
let A0=b[C.focus],r=A0.s+M.sFinish,i=new e.Vector3;t.posAt(r,i),i.y+=M.yLift;
let l=(r%t.LAP+t.LAP)%t.LAP,c=M.tunnel&&l>M.tunnel[0]&&l<M.tunnel[1],
a=new e.Vector3,d=i.clone(),md=C.mode,seat=!!SEATM[md];
if(md==="FREE"){
if(!FC.init){FC.tgt.copy(C.look.lengthSq()?C.look:i);FC.init=!0}
let sp=FC.dist*(FC.k.shift?2.6:.9)*n,fx=Math.sin(FC.yaw),fz=Math.cos(FC.yaw),mv=new e.Vector3;
if(FC.k.w){mv.x-=fx;mv.z-=fz}if(FC.k.s){mv.x+=fx;mv.z+=fz}
if(FC.k.a){mv.x-=fz;mv.z+=fx}if(FC.k.d){mv.x+=fz;mv.z-=fx}
if(FC.k.q)mv.y-=1;if(FC.k.e)mv.y+=1;
if(mv.lengthSq()>0){FC.lock=!1;FC.tgt.addScaledVector(mv.normalize(),sp)}
if(FC.lock&&A0.mesh){let cp=A0.mesh.position;FC.tgt.lerp(new e.Vector3(cp.x,cp.y+1.3,cp.z),1-Math.pow(1e-3,n))}
let cy=Math.cos(FC.pitch);
a.set(FC.tgt.x+FC.dist*cy*Math.sin(FC.yaw),FC.tgt.y+FC.dist*Math.sin(FC.pitch),FC.tgt.z+FC.dist*cy*Math.cos(FC.yaw));
if(a.y<FC.tgt.y-2)a.y=FC.tgt.y-2;
d.copy(FC.tgt)}
else if(seat){let g=(A0.mesh?A0.mesh.position:i).clone(),q3=new e.Vector3;t.tanAt(r,q3);
let rt=new e.Vector3().crossVectors(q3,new e.Vector3(0,1,0)).normalize();
if(md==="ONBOARD"){g.y+=1.12;g.addScaledVector(q3,-.4);a.copy(g);d.copy(g).addScaledVector(q3,26);d.y+=.3}
else if(md==="HELMET"){g.y+=.8;g.addScaledVector(q3,.2);a.copy(g);d.copy(g).addScaledVector(q3,20);d.addScaledVector(rt,(A0.lat||0)*.6);d.y+=.06}
else if(md==="NOSE"){g.y+=.34;g.addScaledVector(q3,2.1);a.copy(g);d.copy(g).addScaledVector(q3,24);d.y+=.55}
else{g.y+=.95;g.addScaledVector(q3,-2.7);a.copy(g);d.copy(g).addScaledVector(q3,-24);d.y+=.45}}
else if(md==="CHASE"||c){let g=new e.Vector3;t.posAt(r-13,g);let tw=new e.Vector3;t.tanAt(r-13,tw);let lx=new e.Vector3().crossVectors(tw,new e.Vector3(0,1,0)).normalize();g.addScaledVector(lx,(A0.lat||0)*.8);g.y+=4.6+M.yLift;a.copy(g);if(A0.mesh)d.copy(A0.mesh.position);d.y+=1.35}
else if(md==="HELI")a.copy(i).add(new e.Vector3(-40,64,26)),d.y+=1;
else{let g=0,A=1e9;for(let w=0;w<F.length;w++){let x=F[w].s-l;x<-20&&(x+=t.LAP),x>=-20&&x<A&&(A=x,g=w)}
a.copy(F[g].pos),d.y+=1,A>170&&(C.until=0)}
let fv=CAMFOV[md]||58;if(md==="CHASE"||seat)fv+=Math.min(13,(A0.spd||0)*.085);
if(Math.abs(G.fov-fv)>.05){G.fov+=(fv-G.fov)*Math.min(1,n*3.2);G.updateProjectionMatrix()}
let u=1-Math.pow(.0015,n);
C.pos.lerp(a,md==="FREE"?1-Math.pow(1e-7,n):seat?1:md==="CHASE"?1-Math.pow(1e-4,n):u);
C.look.lerp(d,md==="FREE"?1-Math.pow(1e-7,n):seat?1:1-Math.pow(5e-5,n));
wh&&(wh.visible=md==="ONBOARD"||md==="HELMET");
G.position.copy(C.pos),G.lookAt(C.look),Et.target.position.copy(C.look),Et.position.set(C.look.x-220,C.look.y+340,C.look.z+150),SKD.position.copy(C.look)}
(function(){let MK={w:1,a:1,s:1,d:1,q:1,e:1},KM={"1":"AUTO","2":"CHASE","3":"ONBOARD","4":"HELMET","5":"NOSE","6":"REAR","7":"TRACKSIDE","8":"HELI","9":"FREE"};
let fr=!1,down=ev=>{if(CAM.mode!=="FREE")return;fr=(ev.button===2||ev.shiftKey)?2:1;FC.lx=ev.clientX;FC.ly=ev.clientY};
addEventListener("pointerdown",down);
addEventListener("pointerup",()=>fr=!1);
addEventListener("pointercancel",()=>fr=!1);
addEventListener("contextmenu",ev=>{if(CAM.mode==="FREE")ev.preventDefault()});
addEventListener("pointermove",ev=>{if(!fr||CAM.mode!=="FREE")return;
let dx=ev.clientX-FC.lx,dy=ev.clientY-FC.ly;FC.lx=ev.clientX;FC.ly=ev.clientY;
if(fr===1){FC.yaw-=dx*.005;FC.pitch=Math.max(-.2,Math.min(1.45,FC.pitch+dy*.004))}
else{FC.lock=!1;let s2=FC.dist*.0018,fx=Math.sin(FC.yaw),fz=Math.cos(FC.yaw);
FC.tgt.x+=(-fz*dx+fx*dy)*s2;FC.tgt.z+=(fx*dx+fz*dy)*s2}});
addEventListener("wheel",ev=>{if(CAM.mode!=="FREE")return;ev.preventDefault();
FC.dist=Math.max(4,Math.min(1200,FC.dist*Math.pow(1.0015,ev.deltaY)))},{passive:!1});
addEventListener("keydown",ev=>{let tn=(ev.target&&ev.target.tagName)||"";if(/INPUT|TEXTAREA|SELECT/.test(tn))return;
if(ev.key===" "||ev.code==="Space"){ev.preventDefault();togglePause();return}
let k=ev.key.toLowerCase();if(MK[k])FC.k[k]=!0;FC.k.shift=ev.shiftKey;
if(KM[ev.key]){setCam(KM[ev.key]);return}
if(k==="f"){setCam(CAM.mode==="FREE"?"AUTO":"FREE");return}
if(k==="l"&&CAM.mode==="FREE"){FC.lock=!FC.lock;return}
if(k==="["||k==="]"){let sel=document.getElementById("focsel");if(!sel)return;
let n2=sel.options.length,cur=[...sel.options].findIndex(x=>x.value===sel.value),
nx=((cur+(k==="]"?1:-1))%n2+n2)%n2;sel.selectedIndex=nx;sel.dispatchEvent(new Event("change"))}});
addEventListener("keyup",ev=>{let k=ev.key.toLowerCase();if(MK[k])FC.k[k]=!1;FC.k.shift=ev.shiftKey});
})();
/* __GOL debug fields are attached at creation (see window.__GOL below) */
var U=document.getElementById("lights"),Gt=[...U.children];function Dt(){if(p.phase!=="countdown"){U.style.display="none";return}U.style.display="flex";let n=p.t+4.4,t=Math.min(5,Math.floor(n/.8));Gt.forEach((o,s)=>o.classList.toggle("on",p.t<0&&s<t)),AUD.started&&window.GOLAudio&&t!==AUD.lastLight&&(AUD.lastLight=t,GOLAudio.startLights(t>=5?0:t)),p.t>=0&&(U.style.display="none",p.phase="racing")}function Nt(n){let t=Math.floor(n/60),o=(n%60).toFixed(2);return t+":"+String(o).padStart(5,"0")}function Ot(){p.phase="done";let n=document.getElementById("resrows");n.innerHTML="";let t=b[st[0]].ft;st.forEach((o,s)=>{let r=b[o],i=r.out?"DNF":s===0?Nt(r.ft):"+"+(r.ft-t).toFixed(2),l=document.createElement("div");l.className="rrow",l.innerHTML=`<span class="pos">${s+1}</span><span class="chip" style="background:#${r.team.color.toString(16).padStart(6,"0")}"></span><span class="tag">${r.team.name}</span><span class="t">${i}</span>`,n.appendChild(l)}),(()=>{let sb=settleBet(),bx=document.getElementById("betres");if(sb){bx.style.display="block";bx.className=sb.won?"win":"lose";bx.innerHTML=sb.won?"WON $"+sb.pay.toLocaleString()+" &middot; "+sb.tag+" @ "+fmtOdds(sb.odds)+"x":"LOST $"+sb.stake.toLocaleString()+" &middot; "+sb.tag}else bx.style.display="none"})(),showPodium(),setTimeout(()=>{document.getElementById("results").style.display="flex"},5300)}
/* ---------- betting layer ---------- */
var BK={get bal(){let v=+localStorage.getItem("gol_bal");return isFinite(v)&&v>0?v:1000},set bal(v){localStorage.setItem("gol_bal",Math.max(0,Math.round(v)))},
get name(){return localStorage.getItem("gol_name")||""},set name(v){localStorage.setItem("gol_name",v)},
get hist(){try{return JSON.parse(localStorage.getItem("gol_hist")||"[]")}catch(q){return[]}},set hist(v){localStorage.setItem("gol_hist",JSON.stringify(v.slice(-40)))}};
var BET={type:"win",pick:null,hA:null,hB:null,ouSide:null,stake:0,odds:{},open:!1};
function mcOdds(trials){trials=trials||1100;let cps=p.comps,laps=p.laps,res=new Array(S).fill(0),posSum=new Array(S).fill(0),podC=new Array(S).fill(0),h2hC=new Array(S*S).fill(0),classC=new Array(S+1).fill(0),pos=new Array(S);
for(let it=0;it<trials;it++){let rr=$((p.seed^(it*2654435761))>>>0),sc=[],scA=rr()<.7,dnf=0;
for(let c=0;c<S;c++){let a=b[c],cp=cps[a.comp],age=0,tsum=0,big=rr()<.05?1.06:1;
for(let L=0;L<laps;L++){let wear=Math.min(.14,cp.w*Math.pow(age,1.3)+(age>cp.cliff?.012*(age-cp.cliff):0));
tsum+=1/(a.rating*big*cp.m*(1-wear));age++}
let score=-tsum*100-(.05*a.gridPos+1.9*Math.pow(Math.max(0,a.gridPos-5),1.5))-a.stops.length*.55+(rr()-.5)*32;
if(rr()<.055){score-=999;dnf++}
sc.push({c:c,s:score})}if(scA){let m=0;for(let z=0;z<S;z++)m+=sc[z].s;m/=S;for(let z=0;z<S;z++)sc[z].s=m+(sc[z].s-m)*.85+(rr()-.5)*8}
sc.sort((x,y)=>y.s-x.s);
for(let k=0;k<sc.length;k++){posSum[sc[k].c]+=k+1;pos[sc[k].c]=k}
res[sc[0].c]++;for(let k=0;k<3;k++)podC[sc[k].c]++;for(let A=0;A<S;A++)for(let B=0;B<S;B++)if(pos[A]<pos[B])h2hC[A*S+B]++;classC[S-dnf]++}
let ep=[];for(let c=0;c<S;c++)ep.push({c:c,p:res[c]/trials,ap:posSum[c]/trials});
let apMin=Math.min.apply(null,ep.map(x=>x.ap)),apMax=Math.max.apply(null,ep.map(x=>x.ap)),o={};
let GAM=.85,OVR=1.07,raw=[],sm=0;
for(let x of ep){let ps=1-(x.ap-apMin)/Math.max(.001,apMax-apMin),v=Math.max(.004,.6*x.p+.4*Math.pow(ps,1.6)*.25);raw.push(v);sm+=v}
let s2=0,pw=raw.map(v=>{let q=Math.pow(v/sm,GAM);s2+=q;return q});
for(let c=0;c<S;c++)o[c]=Math.max(1.08,Math.min(99,1/((pw[c]/s2)*OVR)));
o.pod={};for(let c=0;c<S;c++)o.pod[c]=Math.max(1.08,Math.min(99,1/(Math.max(.01,podC[c]/trials)*OVR)));
o.h2h=h2hC.map(v=>v/trials);
{let cP=new Array(S+1).fill(0);cP[S]=.3;cP[S-1]=.4;cP[S-2]=.3;let bestLine=(S-1)+.5,bestD=9;for(let ln=1.5;ln<S;ln+=1){let po=0;for(let kk=Math.ceil(ln);kk<=S;kk++)po+=cP[kk];if(Math.abs(po-.5)<bestD){bestD=Math.abs(po-.5);bestLine=ln}}let pOver=0;for(let k2=Math.ceil(bestLine);k2<=S;k2++)pOver+=cP[k2];pOver=Math.max(.03,Math.min(.97,pOver));o.ou={line:bestLine,over:Math.max(1.08,Math.min(99,1/(pOver*OVR))),under:Math.max(1.08,Math.min(99,1/((1-pOver)*OVR)))}}
return o}
function fmtOdds(x){return x<10?x.toFixed(2):x.toFixed(1)}
function betGrid(){return [...Array(S).keys()].sort((x,y)=>b[x].gridPos-b[y].gridPos)}
function betRowHTML(ci,right,cls){let a=b[ci];return '<div class="betrow'+(cls||"")+'" data-ci="'+ci+'"><span class="bpos">P'+(a.gridPos+1)+'</span><span class="chip" style="background:#'+a.team.color.toString(16).padStart(6,"0")+'"></span><span class="bname">'+a.team.name+'</span>'+right+'</div>'}
function betRender(){let rows=document.getElementById("betrows");if(!rows)return;let ord=betGrid();
if(BET.type==="win"||BET.type==="pod"){let od=BET.type==="win"?BET.odds:BET.odds.pod;rows.innerHTML=ord.map(function(ci){return betRowHTML(ci,'<span class="bodds">'+fmtOdds(od[ci])+'x</span>',BET.pick===ci?" sel":"")}).join("");[...rows.children].forEach(function(d){d.onclick=function(){BET.pick=+d.dataset.ci;[...rows.children].forEach(function(r){r.classList.toggle("sel",+r.dataset.ci===BET.pick)});upBet()}})}
else if(BET.type==="h2h"){rows.innerHTML='<div class="bhint">Pick two — bet the FIRST to finish ahead of the SECOND</div>'+ord.map(function(ci){let s=BET.hA===ci?'<span class="bside a">1st</span>':BET.hB===ci?'<span class="bside b">2nd</span>':'';let cls=BET.hA===ci?" ab-a":BET.hB===ci?" ab-b":"";return betRowHTML(ci,s,cls)}).join("");[...rows.children].forEach(function(d){if(!d.dataset||!d.dataset.ci)return;d.onclick=function(){let ci=+d.dataset.ci;if(BET.hA===ci)BET.hA=null;else if(BET.hB===ci)BET.hB=null;else if(BET.hA===null)BET.hA=ci;else if(BET.hB===null)BET.hB=ci;else BET.hB=ci;betRender();upBet()}})}
else if(BET.type==="ou"){let ou=BET.odds.ou;rows.innerHTML='<div class="bhint">How many of '+S+' cars finish classified?</div><div id="ourow"><button class="oubtn'+(BET.ouSide==="over"?" sel":"")+'" data-s="over">OVER '+ou.line+'<b>'+fmtOdds(ou.over)+'x</b></button><button class="oubtn'+(BET.ouSide==="under"?" sel":"")+'" data-s="under">UNDER '+ou.line+'<b>'+fmtOdds(ou.under)+'x</b></button></div>';[...rows.querySelectorAll(".oubtn")].forEach(function(bn){bn.onclick=function(){BET.ouSide=bn.dataset.s;[...rows.querySelectorAll(".oubtn")].forEach(function(x){x.classList.toggle("sel",x===bn)});upBet()}})}}
function betOdds(){let o=BET.odds;if(!o)return null;if(BET.type==="win")return BET.pick!==null?o[BET.pick]:null;if(BET.type==="pod")return BET.pick!==null&&o.pod?o.pod[BET.pick]:null;if(BET.type==="h2h")return(BET.hA!==null&&BET.hB!==null&&BET.hA!==BET.hB&&o.h2h)?Math.max(1.08,Math.min(99,1/(Math.max(.01,o.h2h[BET.hA*S+BET.hB])*1.07))):null;if(BET.type==="ou")return BET.ouSide&&o.ou?o.ou[BET.ouSide]:null;return null}
function betLabel(){if(BET.type==="win")return"WIN · "+b[BET.pick].team.name;if(BET.type==="pod")return"PODIUM · "+b[BET.pick].team.name;if(BET.type==="h2h")return"H2H · "+b[BET.hA].team.tag+" › "+b[BET.hB].team.tag;if(BET.type==="ou")return(BET.ouSide==="over"?"OVER ":"UNDER ")+BET.odds.ou.line+" cars";return""}
function showBet(){BET.open=!0;BET.pick=null;BET.hA=null;BET.hB=null;BET.ouSide=null;BET.stake=0;
let el=document.getElementById("betpanel"),rows=document.getElementById("betrows");
document.getElementById("betbal").textContent="$"+BK.bal.toLocaleString();
document.getElementById("bettrack").textContent=M.label+" · "+p.laps+" LAPS";
BET.odds=mcOdds(320);
(function(){let tabs=document.querySelectorAll("#bettabs .btab");tabs.forEach(t=>{t.classList.toggle("on",t.dataset.t===BET.type);t.onclick=()=>{BET.type=t.dataset.t;BET.pick=null;BET.hA=null;BET.hB=null;BET.ouSide=null;tabs.forEach(x=>x.classList.toggle("on",x===t));betRender();upBet()}})})();
betRender();
el.style.display="flex";upBet()}
function upBet(){let od=betOdds(),ok=od!==null&&BET.stake>0&&BET.stake<=BK.bal;
document.getElementById("betgo").disabled=!ok;
document.getElementById("betstake").textContent="$"+BET.stake;
document.getElementById("betret").textContent=ok?"returns $"+Math.round(BET.stake*od).toLocaleString():"—";
[...document.querySelectorAll("#betchips .chip2")].forEach(c=>c.classList.toggle("on",+c.dataset.v===BET.stake))}
function closeBet(go){BET.open=!1;document.getElementById("betpanel").style.display="none";
if(go&&betOdds()!==null&&BET.stake>0){BK.bal=BK.bal-BET.stake;BET.placed={type:BET.type,pick:BET.pick,hA:BET.hA,hB:BET.hB,ouSide:BET.ouSide,line:BET.odds.ou?BET.odds.ou.line:0,stake:BET.stake,odds:betOdds(),label:betLabel()}}else BET.placed=null;
document.getElementById("bal").textContent="$"+BK.bal.toLocaleString();
p.phase="countdown";p.t=-4.4}
function settleBet(){let pl=BET.placed;if(!pl)return null;
let won=!1;if(st.length){let fp=function(ci){return st.indexOf(ci)};if(pl.type==="pod")won=fp(pl.pick)>=0&&fp(pl.pick)<3;else if(pl.type==="h2h")won=fp(pl.hA)>=0&&fp(pl.hB)>=0&&fp(pl.hA)<fp(pl.hB);else if(pl.type==="ou"){let cl=b.filter(function(x){return!x.out}).length;won=pl.ouSide==="over"?cl>pl.line:cl<pl.line}else won=st[0]===pl.pick}let pay=won?Math.round(pl.stake*pl.odds):0;
BK.bal=BK.bal+pay;
let h=BK.hist;h.push({t:M.label,d:pl.label,s:pl.stake,o:pl.odds,w:won,p:pay});BK.hist=h;
document.getElementById("bal").textContent="$"+BK.bal.toLocaleString();
BET.placed=null;
if(window.golPush)window.golPush(BK.bal);
return{won:won,pay:pay,tag:pl.label,stake:pl.stake,odds:pl.odds}}

/* ---------- shared leaderboard ---------- */
var SB={url:"https://elndriczyjzagcahvact.supabase.co",key:"sb_publishable_2PPGOUljh-m_3xSSUFZ3Vg_xkIqE4Vw"};
function sbHead(){return{apikey:SB.key,Authorization:"Bearer "+SB.key,"Content-Type":"application/json"}}
async function golPush(bal){let nm=BK.name;if(!nm)return;
let h=BK.hist,races=h.length,wins=h.filter(x=>x.w).length;
try{await fetch(SB.url+"/rest/v1/leaderboard",{method:"POST",headers:Object.assign(sbHead(),{Prefer:"resolution=merge-duplicates"}),
body:JSON.stringify({player:nm,balance:Math.round(bal),races:races,wins:wins,updated_at:new Date().toISOString()})})}catch(q){}}
window.golPush=golPush;
async function golBoard(){let el=document.getElementById("lbrows");el.innerHTML='<div class="lbrow"><span>loading…</span></div>';
try{let r=await fetch(SB.url+"/rest/v1/leaderboard?select=player,balance,races,wins&order=balance.desc&limit=15",{headers:sbHead()}),d=await r.json();
if(!d.length){el.innerHTML='<div class="lbrow"><span>no players yet — place a bet to join</span></div>';return}
el.innerHTML=d.map((p2,i)=>'<div class="lbrow'+(p2.player===BK.name?" me":"")+'"><span class="lbp">'+(i+1)+'</span><span class="lbn">'+p2.player.replace(/[<>]/g,"")+'</span><span class="lbw">'+p2.wins+"/"+p2.races+'</span><span class="lbb">$'+p2.balance.toLocaleString()+'</span></div>').join("")}
catch(q){el.innerHTML='<div class="lbrow"><span>leaderboard offline</span></div>'}}
function askName(){let n=prompt("Name for the leaderboard (max 24 chars):",BK.name||"");
if(n&&n.trim()){BK.name=n.trim().slice(0,24);document.getElementById("lbme").textContent=BK.name;golPush(BK.bal);golBoard()}}

/* ---------- main menu ---------- */
var MENU={track:null,laps:13,open:!1};
var TMETA={suzuka:{n:"SUZUKA",l:"5.807 km"},monza:{n:"MONZA",l:"5.793 km"},spa:{n:"SPA",l:"7.004 km"},
imola:{n:"IMOLA",l:"4.909 km"},silverstone:{n:"SILVERSTONE",l:"5.891 km"},barcelona:{n:"BARCELONA",l:"4.675 km"},singapore:{n:"SINGAPORE",l:"5.063 km"},nurburgring:{n:"NÜRBURGRING",l:"5.148 km"},shanghai:{n:"SHANGHAI",l:"5.451 km"}};
var TOK={};
async function probeTracks(){await Promise.all(Object.keys(TMETA).map(async k=>{
let u=k==="oval"?Y+"tracks/oval.glb":Y+"tracks/"+k+".glb";
try{let r=await fetch(u,{method:"HEAD"});TOK[k]=r.status!==404}catch(q){TOK[k]=!0}}))}
function drawMenu(){let g=document.getElementById("tgrid");g.innerHTML="";
Object.keys(TMETA).forEach(k=>{let ok=TOK[k]!==!1,d=document.createElement("div");
d.className="tcard"+(ok?"":" dim")+(MENU.track===k?" sel":"");
d.innerHTML='<div class="tn">'+TMETA[k].n+'</div><div class="tl">'+(ok?TMETA[k].l:"not installed")+'</div>';
d.onclick=()=>{MENU.track=k;drawMenu()};
g.appendChild(d)});
document.getElementById("mbal").textContent="$"+BK.bal.toLocaleString();
document.getElementById("mname").textContent=BK.name||"set name";
document.getElementById("mgo").disabled=!MENU.track}
async function showMenu(){MENU.open=!0;p.running=!1;
document.getElementById("results").style.display="none";
document.getElementById("betpanel").style.display="none";
document.getElementById("loading").style.display="none";
document.getElementById("menu").style.display="flex";
document.getElementById("mgo").disabled=!0;
await probeTracks();
let av=Object.keys(TMETA).filter(k=>TOK[k]!==!1);
if(!MENU.track||TOK[MENU.track]===!1)MENU.track=av.includes("suzuka")?"suzuka":(av[0]||"suzuka");
drawMenu();
p.phase="menu"}
function hideMenu(){MENU.open=!1;document.getElementById("menu").style.display="none"}
async function startFromMenu(){
  if(!MENU.track){return}
  hideMenu();
  var ld=document.getElementById("loading");
  if(ld){ld.style.display="flex";ld.textContent="LOADING CIRCUIT\u2026"}
  try{
    var r=await startQualifying(MENU.track,MENU.laps);
    if(r===null){showMenu()}
  }catch(err){
    console.warn("start failed",err);
    if(ld){ld.style.display="none"}
    showMenu()
  }
}

/* ---------- night race lighting (Singapore): dark sky, floodlight rig, low ambient, headlight/tail glow ---------- */
var NR=null;
function nightRig(on){if(NR){B.remove(NR);NR=null}if(!on||!M||!M.geom)return;NR=new e.Group;var g=M.geom,i=0;for(var d=0;d<g.LAP;d+=Math.max(150,g.LAP/12)){var pos=new e.Vector3;g.posAt(d,pos);var tan=new e.Vector3;g.tanAt(d,tan);var side=new e.Vector3().crossVectors(tan,W).normalize();var pp=pos.clone().addScaledVector(side,(i%2?1:-1)*17);pp.y+=(M.yLift||0);var pole=new e.Mesh(new e.CylinderGeometry(.35,.5,22,6),new e.MeshLambertMaterial({color:2237474}));pole.position.copy(pp);pole.position.y+=11;NR.add(pole);var lamp=new e.PointLight(16773320,55,95,1.7);lamp.position.copy(pp);lamp.position.y+=21;NR.add(lamp);i++}B.add(NR)}
function carGlow(on){for(var i=0;i<b.length;i++){var cm=b[i].mesh;if(!cm)continue;if(on){if(!cm.userData.glow){var gl=new e.Group;var m1=new e.MeshBasicMaterial({color:16773320}),m2=new e.MeshBasicMaterial({color:16723760});var hl=new e.Mesh(new e.SphereGeometry(.32,8,8),m1);hl.position.set(.62,.42,2.3);var hr=hl.clone();hr.position.x=-.62;var tl=new e.Mesh(new e.SphereGeometry(.26,8,8),m2);tl.position.set(0,.5,-2.35);gl.add(hl,hr,tl);cm.add(gl);cm.userData.glow=gl}cm.userData.glow.visible=!0}else if(cm.userData.glow)cm.userData.glow.visible=!1}}
function nightMode(on){if(on){HEMI.intensity=.28;Et.intensity=.5;Et.color.setHex(12574719);j.toneMappingExposure=.8;if(SKD&&SKD.material)SKD.material.uniforms.c2.value.copy(new e.Color(M.sky).lerp(new e.Color(1720128),.5))}else{HEMI.intensity=.75;Et.intensity=1.15;Et.color.setHex(16773853);j.toneMappingExposure=.92}nightRig(on);carGlow(on)}
/* ---------- safety car: deploy on a crash, bunch the field behind the leader, cheap pit window, single-file restart ---------- */
function deploySC(){var ll=0;for(var i=0;i<S;i++)if(!b[i].out&&b[i].lap>ll)ll=b[i].lap;SC.active=!0;SC.used=!0;SC.endLap=Math.min(ll+2,p.laps);var el=document.getElementById("scbanner");if(el)el.style.display="block";say("<b>SAFETY CAR</b> \xB7 incident — field bunching up, pit window open")}
function scPrep(o){var ord=[];for(var i=0;i<S;i++)if(!b[i].out)ord.push(i);ord.sort(function(x,y){return b[y].s-b[x].s});if(!ord.length)return;var leader=b[ord[0]];if(leader.lap>=SC.endLap){endSC();return}for(var r=0;r<ord.length;r++){var a=b[ord[r]];var base=o.speedAt(a.s+M.sFinish);var pace=base*.45;if(r===0)a.scTg=pace;else{var ahead=b[ord[r-1]];var gap=ahead.s-a.s;a.scTg=pace*(gap>SC.GAP*1.2?1.8:gap<SC.GAP*.7?.45:1)}}}
function endSC(){SC.active=!1;for(var i=0;i<S;i++)b[i].scTg=void 0;var el=document.getElementById("scbanner");if(el)el.style.display="none";say("<b>GREEN FLAG</b> \xB7 safety car in — racing resumes")}
/* ---------- oval sprint qualifying: 20s standing-start sprint sets the grid ---------- */
function qualRows(){var el=document.getElementById("qualrows");if(!el)return;el.innerHTML="";QUAL.rows=[];for(var n=0;n<S;n++){var d=document.createElement("div");d.className="qrow";d.innerHTML='<span class="qp">'+(n+1)+'</span><span class="qc"></span><span class="qt"></span><span class="qg"></span>';el.appendChild(d);QUAL.rows.push(d)}}
async function startQualifying(track,laps){QUAL.track=track;QUAL.laps=laps;QUAL.result=null;QUAL.consume=!1;QUAL.active=!1;if(QUAL._auto){clearTimeout(QUAL._auto);QUAL._auto=0}try{await ht("oval")}catch(err){console.warn("oval load failed; skipping qualifying",err);return v({track:track,laps:laps})}var ld=document.getElementById("loading");if(ld)ld.style.display="none";var seed=Math.floor(Math.random()*1e9)>>>0;QUAL.qrng=$(seed);var order=ft([...Array(S).keys()],$((seed^0x9e3779b1)>>>0));b.forEach(function(a,idx){var gp=order.indexOf(idx);a.qs=-(gp*7)-4;a.qspd=0;a.qlat=(gp%2?1:-1)*3;a.qrat=.95+QUAL.qrng()*.1;a.qreact=.15+QUAL.qrng()*.55;a.out=!1;a.crashing=0;a.inPit=!1;a.finished=!1;a.gTarget=0;a.gClamp=0});QUAL.t=0;QUAL.active=!0;p.running=!1;p.phase="qualifying";document.body.classList.add("qualifying");qualRows();var qel=document.getElementById("qual");if(qel){qel.classList.remove("summary");qel.style.display="block"}var qt=document.getElementById("qualtitle");if(qt)qt.textContent="OVAL SPRINT \xB7 QUALIFYING";var sk=document.getElementById("qualskip");if(sk)sk.textContent="SKIP QUALIFYING ›";say("<b>QUALIFYING</b> \xB7 20-second oval sprint sets the grid");return{qual:!0}}
function qualTick(n){try{var o=M.geom;QUAL.t+=n;for(var c=0;c<S;c++){var a=b[c];var launch=QUAL.t<a.qreact?0:Math.min(1,(QUAL.t-a.qreact)/2.6);var base=o.speedAt(a.qs+M.sFinish);var tg=base*a.qrat*(.35+.65*launch)*(1+(QUAL.qrng()-.5)*.03);a.qspd+=(tg-a.qspd)*Math.min(1,n*1.8);a.qs+=a.qspd*n;var u=0;for(var E=0;E<S;E++){if(E===c)continue;var f=b[E].qs-a.qs;if(Math.abs(f)<11)u+=(c<E?1:-1)*2*Math.max(0,1-Math.abs(f)/11)}a.qlat+=(Math.max(-3,Math.min(3,u))-a.qlat)*Math.min(1,n*3);var g=a.qs+M.sFinish,A=new e.Vector3;o.posAt(g,A);var w=new e.Vector3;o.tanAt(g,w);var x=new e.Vector3().crossVectors(w,W).normalize();A.addScaledVector(x,a.qlat);A.y+=M.yLift;a.mesh.position.copy(A);a.mesh.rotation.y=Math.atan2(w.x,w.z);a.speed=a.qspd}var ord=b.map(function(aa,i){return{i:i,s:aa.qs}}).sort(function(p1,q1){return q1.s-p1.s});if(QUAL.rows){var lead=ord[0];ord.forEach(function(r,l){var row=QUAL.rows[l],a=b[r.i];row.querySelector(".qc").style.background="#"+a.team.color.toString(16).padStart(6,"0");row.querySelector(".qt").textContent=a.team.tag;row.querySelector(".qg").textContent=l===0?"LEADER":"+"+((lead.s-r.s)/Math.max(b[lead.i].qspd,1)).toFixed(1)})}var tel=document.getElementById("qualtimer");if(tel)tel.textContent=Math.max(0,20-QUAL.t).toFixed(1)+"s";var fa=b[ord[0].i];var ci=new e.Vector3;o.posAt(fa.qs+M.sFinish-16,ci);ci.y+=6+M.yLift;var cl=new e.Vector3;o.posAt(fa.qs+M.sFinish+6,cl);cl.y+=1+M.yLift;C.pos.lerp(ci,1-Math.pow(1e-4,n));C.look.lerp(cl,1-Math.pow(5e-5,n));G.position.copy(C.pos);G.lookAt(C.look);SKD.position.copy(C.look);Et.target.position.copy(C.look);Et.position.set(C.look.x-220,C.look.y+340,C.look.z+150);if(QUAL.t>=20)finishQualifying(ord.map(function(r){return r.i}))}catch(err){console.warn("qual tick error; skipping to race",err);QUAL.active=!1;QUAL.result=null;QUAL.consume=!1;hideQual();v({track:QUAL.track,laps:QUAL.laps})}}
function finishQualifying(order){QUAL.active=!1;QUAL.result=order.slice();QUAL.consume=!0;p.phase="qualdone";var qel=document.getElementById("qual");if(qel)qel.classList.add("summary");var qt=document.getElementById("qualtitle");if(qt)qt.textContent="STARTING GRID";var tel=document.getElementById("qualtimer");if(tel)tel.textContent="";if(QUAL.rows)order.forEach(function(ci,l){var row=QUAL.rows[l],a=b[ci];row.querySelector(".qc").style.background="#"+a.team.color.toString(16).padStart(6,"0");row.querySelector(".qt").textContent=a.team.name;row.querySelector(".qg").textContent="P"+(l+1)});var sk=document.getElementById("qualskip");if(sk)sk.textContent="TO BETTING ›";say("<b>GRID SET</b> \xB7 "+b[order[0]].team.name+" on pole");QUAL._auto=setTimeout(proceedToRace,2800)}
function proceedToRace(){if(QUAL._auto){clearTimeout(QUAL._auto);QUAL._auto=0}hideQual();v({track:QUAL.track,laps:QUAL.laps})}
function skipQual(){if(QUAL._auto){clearTimeout(QUAL._auto);QUAL._auto=0}if(QUAL.active){QUAL.active=!1;QUAL.result=null;QUAL.consume=!1;hideQual();v({track:QUAL.track,laps:QUAL.laps})}else proceedToRace()}
function hideQual(){document.body.classList.remove("qualifying");var qel=document.getElementById("qual");if(qel)qel.style.display="none"}
/* ---------- commentary ---------- */
var CMT={last:{},msgs:[],t:0};
function say(html){let el=document.getElementById("ticker");el.style.display="block";el.innerHTML=html;CMT.t=0}
function commentate(dt2){if(p.phase!=="racing")return;CMT.t+=dt2;
let ord=b.map((a,i)=>({i,s:a.s,o:a.out,f:a.finished})).filter(x=>!x.o).sort((x,y)=>y.s-x.s);
ord.forEach((x,pos)=>{let prev=CMT.last[x.i];
if(prev!==void 0&&pos<prev&&CMT.t>2.2){let ov=ord[pos+1];if(ov&&Math.abs(b[x.i].s-b[ov.i].s)<40){
say("<b>P"+(pos+1)+"</b> "+b[x.i].team.name+" passes "+b[ov.i].team.name)}}
CMT.last[x.i]=pos});
for(let c=0;c<S;c++){let a=b[c];
if(a.inPit&&!a._sp){a._sp=1;say("<b>PIT</b> "+a.team.name+" boxes for "+a.newComp)}
if(!a.inPit&&a._sp===1){a._sp=2;say("<b>OUT</b> "+a.team.name+" rejoins on "+a.comp)}
if(a.out&&!a._so){a._so=1;say("<b>INCIDENT</b> "+a.team.name+" is out")}}}
/* ---------- camera control ---------- */
var CAM={mode:"AUTO",focus:-1};
function setCam(m){CAM.mode=m;[...document.querySelectorAll("#cambar .cb")].forEach(c=>c.classList.toggle("on",c.dataset.m===m));if(m==="FREE"){FC.init=!1;FC.lock=!0;var dv=new e.Vector3().subVectors(C.pos,C.look);FC.dist=Math.max(10,dv.length()||70);FC.yaw=Math.atan2(dv.x,dv.z);FC.pitch=Math.asin(Math.max(-1,Math.min(1,dv.y/(dv.length()||1))))}if(m!=="AUTO"){C.mode=m;C.until=1e9}else C.until=0;var hp=document.getElementById("camhelp");if(hp)hp.style.display=m==="FREE"?"block":"none"}
function fillFocus(){let sel=document.getElementById("focsel");if(sel.options.length>1)return;
b.forEach((a,i)=>{let o=document.createElement("option");o.value=i;o.textContent="Follow: "+a.team.name;sel.appendChild(o)})}
/* ---------- interactive map ---------- */
function drawBig(){let cv=document.getElementById("bmcanvas"),g=cv.getContext("2d"),W=760;
g.clearRect(0,0,W,W);if(!N.length)return;
let sc2=W/316;g.save();g.scale(sc2,sc2);
g.beginPath();N.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();
g.strokeStyle="rgba(255,255,255,.9)";g.lineWidth=6;g.lineJoin="round";g.stroke();g.restore();
let ord=b.map((a,i)=>({i,s:a.s,o:a.out})).sort((x,y)=>y.s-x.s);
ord.forEach((x,pos)=>{let a=b[x.i],idx=Math.floor(((a.s+M.sFinish)%M.geom.LAP+M.geom.LAP)%M.geom.LAP/M.geom.ds/6),pt=N[Math.min(idx,N.length-1)];
let px=pt[0]*sc2,py=pt[1]*sc2;
g.beginPath();g.arc(px,py,13,0,7);g.fillStyle=a.out?"#555":"#"+a.team.color.toString(16).padStart(6,"0");g.fill();
g.lineWidth=2.5;g.strokeStyle="#0a0c12";g.stroke();
g.fillStyle=a.out?"#999":"#fff";g.font="900 11px Arial";g.textAlign="center";g.textBaseline="middle";
g.fillText(a.team.tag,px,py);
g.fillStyle="#ffd24a";g.font="800 10px Arial";g.fillText("P"+(pos+1),px,py-20)})}
var BIGMAP=!1;
/* ---------- podium ---------- */
function showPodium(){let st3=st.slice(0,3);if(st3.length<3)return;
let el=document.getElementById("podstand"),med=["🥇","🥈","🥉"],ord=[1,0,2],cls=["p2","p1","p3"];
el.innerHTML="";ord.forEach((oi,k)=>{let a=b[st3[oi]],d=document.createElement("div");
d.className="p "+cls[k];d.innerHTML='<div class="medal">'+med[oi]+'</div><div class="nm">'+a.team.name+'</div><div class="tm">P'+(oi+1)+'</div>';
el.appendChild(d)});
document.getElementById("results").style.display="none";document.getElementById("podium").style.display="flex";
fireworks(5200);
setTimeout(()=>document.getElementById("podium").style.display="none",5200)}
/* ---------- fireworks ---------- */
var FW=[];
function fireworks(ms){let end=performance.now()+ms;
let burst=()=>{if(performance.now()>end)return;
let cx=(Math.random()*.7+.15),cy=(Math.random()*.35+.1),col=["#ffd24a","#ff6a3d","#7dffb4","#6ab8ff","#ff8ae2"][Math.floor(Math.random()*5)];
for(let i=0;i<46;i++){let ang=Math.random()*6.283,sp=40+Math.random()*130;
FW.push({x:cx*innerWidth,y:cy*innerHeight,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:1,col:col})}
setTimeout(burst,320+Math.random()*420)};burst()}
function drawFW(dt2){let cv=document.getElementById("fwcanvas");if(!cv)return;
if(cv.width!==innerWidth){cv.width=innerWidth;cv.height=innerHeight}
let g=cv.getContext("2d");g.clearRect(0,0,cv.width,cv.height);
if(!FW.length)return;
for(let i=FW.length-1;i>=0;i--){let f=FW[i];f.life-=dt2*.55;
if(f.life<=0){FW.splice(i,1);continue}
f.x+=f.vx*dt2;f.y+=f.vy*dt2;f.vy+=95*dt2;
g.globalAlpha=Math.max(0,f.life);g.fillStyle=f.col;g.fillRect(f.x,f.y,3,3)}
g.globalAlpha=1}
try{window.__GOL={get p(){return p},get b(){return b},get M(){return M},get C(){return C},CAM:CAM,setCam:setCam,FC:FC}}catch(q){}
function pitTick(n){if(!M||!M.pit)return;var ab=-1;
for(var c=0;c<S;c++){var a=b[c];if(a.inPit&&a.spd<3.5){ab=a.boxI||0;break}}
try{PLA(M.pit.group,n,ab)}catch(q){}}
var AUD={on:localStorage.getItem("gol_snd")!=="0",started:!1,acc:0,lastLight:0,maxSpd:1};
function audStart(){if(AUD.started||!AUD.on)return;if(window.GOLAudio&&GOLAudio.init()){AUD.started=!0;GOLAudio.setEnabled(!0)}}
function audToggle(){AUD.on=!AUD.on;localStorage.setItem("gol_snd",AUD.on?"1":"0");
var el=document.getElementById("sndbtn");if(el)el.textContent=AUD.on?"♪ ON":"♪ OFF";
if(!window.GOLAudio)return;if(AUD.on){audStart();GOLAudio.setEnabled(!0)}else GOLAudio.setEnabled(!1)}
addEventListener("pointerdown",audStart,{once:!1});
addEventListener("keydown",audStart,{once:!1});
function audTick(n){if(!AUD.started||!AUD.on||!window.GOLAudio||!M)return;
AUD.acc+=n;if(AUD.acc<.045)return;AUD.acc=0;
var cp=G.position,fw=new e.Vector3;G.getWorldDirection(fw);
var rt=new e.Vector3().crossVectors(fw,new e.Vector3(0,1,0)).normalize();
var live=[],mx=1;
for(var c=0;c<S;c++){var a=b[c];if(!a.mesh)continue;if(a.spd>mx)mx=a.spd}
AUD.maxSpd+=(mx-AUD.maxSpd)*.15;
for(var c2=0;c2<S;c2++){var a2=b[c2];if(!a2.mesh||a2.out){GOLAudio.releaseEngine("c"+c2);continue}
var dv=a2.mesh.position.clone().sub(cp),dist=dv.length();
live.push({id:"c"+c2,d:dist,a:a2,dv:dv})}
live.sort(function(x,y){return x.d-y.d});
for(var k=0;k<live.length;k++){var L=live[k];
if(k>=6){GOLAudio.releaseEngine(L.id);continue}
var d01=Math.min(1,L.d/260),
sp=Math.max(0,L.a.spd)/Math.max(20,AUD.maxSpd),
rpm=L.a.inPit?.22+.1*sp:Math.min(1,.28+sp*.78+(L.a.crashing>0?-.2:0)),
load=L.a.inPit?.15:Math.min(1,.35+sp*.6),
pan=Math.max(-1,Math.min(1,L.dv.clone().normalize().dot(rt)));
if(C.mode==="ONBOARD"||C.mode==="HELMET"||C.mode==="NOSE"||C.mode==="REAR"){if(L.a===b[C.focus]){d01=.02;pan=0}}
GOLAudio.engine(L.id,rpm,load,d01,pan)}
var lead=b[yt&&yt.length?yt[0]:0];
GOLAudio.crowd(p.phase==="racing"?Math.min(1,.35+(lead&&lead.lap?lead.lap/Math.max(1,p.laps):0)*.5):.18)}
var PAUSED=!1;
function setPause(v){PAUSED=!!v;var el=document.getElementById("pausebtn");if(el){el.textContent=PAUSED?"▶ RESUME":"❙❙ PAUSE";el.classList.toggle("on",PAUSED)}var bd=document.getElementById("pausebadge");if(bd)bd.style.display=PAUSED?"block":"none"}
function togglePause(){if(p.phase!=="racing")return;setPause(!PAUSED)}
var Wt=new e.Clock,Q=0;function Mt(){requestAnimationFrame(Mt);let n=Math.min(.25,Wt.getDelta()),t=n*(p.t<0?1:p.timeScale);if(PAUSED&&p.phase==="racing")t=0;if(p.phase==="menu"){j.render(B,G);return}if(p.phase==="betting"){BET.open||showBet();dt(n);j.render(B,G);return}if(p.phase==="qualifying"){qualTick(n);j.render(B,G);return}if(p.phase==="qualdone"){j.render(B,G);return}if(p.running&&M&&b.length){let o=M.geom;p.t+=t;let s=Math.max(0,p.t),l=!0;if(SC.active)scPrep(o);for(let c=0;c<S;c++){let a=b[c];a.prevS=a.s;if(a.out){continue}if(a.crashing>0){a.crashing-=t;a.spd*=Math.pow(.015,t/(1.1*p.timeScale));a.s+=a.spd*t;a.lat+=(a.crashLat-a.lat)*Math.min(1,t*2.2/p.timeScale);if(a.crashing<=0){a.out=!0;a.spd=0}}else{let base=o.speedAt(a.s+M.sFinish),cp=p.comps[a.comp],wear=Math.min(.14,cp.w*Math.pow(a.age,1.3)+(a.age>cp.cliff?.012*(a.age-cp.cliff):0)),k=a.pace*a.form*(a.big||1)*(a.wob||1)*cp.m*(1-wear);if(a.momT>0){a.momT-=t;k*=.55}if(s<a.react)k*=.12;else if(s<a.react+5.2)k*=.15+.85*Math.pow((s-a.react)/5.2,1.5);let tg=base*k;if(a.inPit){let pu=(a.s-a.pitS0)/PITLEN,dd=Math.abs(pu-(a.boxU||.5));tg=Math.min(tg,dd<(a.stopW||.009)?1.1:dd<.05?PITSPD*.45:PITSPD)}if(SC.active&&a.scTg!==void 0&&!a.inPit)tg=a.scTg;a.spd+=(tg-a.spd)*Math.min(1,t*1.6);a.s+=a.spd*t;let ln=Math.floor(a.s/o.LAP);if(ln>a.lap){a.lap=ln;a.age++;a.wob=1+(lt()-.5)*.05;if(lt()<.09&&!a.inPit){let loss=1.2+lt()*5;a.momT=Math.min(9,loss/.45)*p.timeScale}let sp=a.stops[0];if(sp&&ln>=sp.lap&&!a.inPit){a.inPit=!0;a.pitS0=ln*o.LAP;a.pitEnd=a.pitS0+PITLEN;a.newComp=sp.c;a.stops.shift();a.stopW=.009*(.7+lt()*.8);a.boxU=M.pit?M.pit.boxUFor(c):.5;a.boxI=M.pit?M.pit.boxIndexFor(c):c;AUD.started&&window.GOLAudio&&GOLAudio.pitBeep()}}if(a.inPit&&a.s>a.pitEnd){a.inPit=!1;a.comp=a.newComp;a.age=0}for(let cr of p.crashes)if(!cr.done&&cr.car===c&&a.s>=cr.at){cr.done=!0;AUD.started&&window.GOLAudio&&GOLAudio.crash();a.crashing=1.1*p.timeScale;a.crashLat=(lt()<.5?-1:1)*9.5;a.spin=(lt()<.5?-1:1)*22/p.timeScale;a.inPit=!1;C.mode="TRACKSIDE";C.focus=c;C.until=(C.wall||0)+4.5;document.getElementById("camlabel").textContent="INCIDENT \xB7 "+a.team.tag;if(!SC.used&&!SC.active)deploySC()}if(!a.finished&&a.s>=p.raceDist){a.finished=!0;a.ft=s-(a.s-p.raceDist)/Math.max(a.spd,1)}}if(!(a.finished||a.out))l=!1;let u=0;for(let E=0;E<S;E++){if(E===c||b[E].out&&Math.abs(b[E].s-a.s)>16)continue;let f=b[E].s-a.s;if(Math.abs(f)<12){let h=c<E?1:-1;u+=h*2.3*Math.max(0,1-Math.abs(f)/12)}}u=Math.max(-2.7,Math.min(2.7,u));if(!a.crashing&&!a.out)a.lat+=(u+a.laneBias*.4-a.lat)*Math.min(1,t*4);let g=a.s+M.sFinish,A=new e.Vector3;o.posAt(g,A);let w=new e.Vector3;o.tanAt(g,w);let x=new e.Vector3().crossVectors(w,W).normalize();A.addScaledVector(x,a.lat),A.y+=M.yLift;if(a.inPit&&M.pit){let pu=Math.max(0,Math.min(1,(a.s-a.pitS0)/PITLEN)),PP=M.pit.pathAt(pu,new e.Vector3()),dd=Math.abs(pu-(a.boxU||.5)),bw=Math.max(0,1-dd/.028);if(bw>0){let BP=M.pit.boxPosAt(a.boxI||0,new e.Vector3());PP.lerp(BP,bw*bw*(3-2*bw))}A.copy(PP);A.y+=M.yLift;M.pit.tangentAt(pu,w)}a.mesh.position.copy(A);
if(M.group&&a.gClamp===void 0)a.gClamp=0;
if(M.group&&(rcTick%S)===c){RAY.set(new e.Vector3(A.x,A.y+14,A.z),RDOWN);let hh=RAY.intersectObject(M.group,!0);if(hh.length){let want=hh[0].point.y-A.y;isFinite(want)&&Math.abs(want)<12&&(a.gTarget=want)}}
a.gClamp+=((a.gTarget||0)-a.gClamp)*Math.min(1,t*3.5);a.mesh.position.y+=a.gClamp;if(a.crashing>0)a.mesh.rotation.y+=a.spin*t;else{a.mesh.rotation.y=Math.atan2(w.x,w.z);let R=new e.Vector3;o.posAt(g,R);let m=new e.Vector3;o.posAt(g+6,m);a.mesh.rotation.x=Math.atan2(-(m.y-R.y),6)*.8}a.speed=(a.s-a.prevS)/Math.max(t,1e-4);{let ws=a.mesh.userData.wheels;if(ws&&ws.length){let spin=a.speed*t/.36;for(let wi=0;wi<ws.length;wi++)ws[wi].rotation.x-=spin}}}rcTick++;if(Dt(),p.phase==="racing"&&l){st=b.map((a,d)=>d).sort((a,d)=>b[a].out&&b[d].out?b[d].s-b[a].s:b[a].out?1:b[d].out?-1:b[a].ft-b[d].ft);let c=et;setTimeout(()=>{c===et&&Ot()},900),p.phase="cooldown"}dt(n),audTick(n),pitTick(n),commentate(n),BIGMAP&&drawBig(),Q+=n,Q>.2&&(Q=0,jt(),It())}else dt(n);j.render(B,G);drawFW(n)}function jt(){let n=M.geom,t=b.map((i,l)=>({i:l,s:i.s,f:i.finished,ft:i.ft,o:i.out})).sort((i,l)=>i.o&&l.o?l.s-i.s:i.o?1:l.o?-1:i.f&&l.f?i.ft-l.ft:l.s-i.s);yt=t.map(i=>i.i);let o=b[t[0].i],s=Math.max(o.speed||0,1);t.forEach((i,l)=>{let c=nt[l],a=b[i.i];c.querySelector(".chip").style.background="#"+a.team.color.toString(16).padStart(6,"0"),c.querySelector(".tag").textContent=a.team.tag,c.querySelector(".gap").textContent=a.out?"OUT":a.inPit?"PIT":l===0?"LEADER":a.finished?"+"+(a.ft-o.ft).toFixed(1):"+"+((t[0].s-i.s)/Math.max(s,1)).toFixed(1);let ty=c.querySelector(".tyre");ty.textContent=a.out?"":a.comp;ty.style.color=a.out?"":p.comps[a.comp].col;c.style.opacity=a.out?.45:1,it[i.i]!==l&&(c.classList.add("flash"),setTimeout(()=>c.classList.remove("flash"),600)),it[i.i]=l});let r=Math.max(1,Math.min(p.laps,1+Math.floor(b[t[0].i].s/n.LAP)));document.getElementById("lapval").innerHTML=`${r}<small>/${p.laps}</small>`,document.getElementById("leadval").textContent=b[t[0].i].team.tag,document.getElementById("spdval").innerHTML=`${Math.round((b[C.focus].speed||0)*2.23694)}<small> mph</small>`}(async function(){await Promise.all([Ct(),Lt(),Uw(),C2()]);for(let t=0;t<S;t++){let o=Vt(q[t]);B.add(o),b.push({mesh:o,team:q[t],s:0,lat:0,finished:!1,ft:0})}document.getElementById("loading").style.display="none",document.getElementById("btnNew").onclick=()=>showMenu(),document.getElementById("btnNew2").onclick=()=>startFromMenu(),(()=>{let _qs=document.getElementById("qualskip");if(_qs)_qs.onclick=skipQual})(),document.getElementById("btnReplay").onclick=()=>_&&v(_),document.getElementById("btnReplay2").onclick=()=>_&&v(_),(()=>{let q=document.getElementById("trackSel");q&&(q.onchange=()=>v({track:q.value}))})(),(()=>{let cs=document.querySelectorAll("#betchips .chip2");cs.forEach(c=>c.onclick=()=>{BET.stake=+c.dataset.v;upBet()});
document.getElementById("betgo").onclick=()=>closeBet(!0);document.getElementById("betskip").onclick=()=>closeBet(!1);
document.getElementById("bal").textContent="$"+BK.bal.toLocaleString()})();(()=>{let lb=document.getElementById("lbtoggle"),pl=document.getElementById("lbpanel");
lb.onclick=()=>{let on=pl.style.display!=="block";pl.style.display=on?"block":"none";on&&golBoard()};
document.getElementById("lbme").textContent=BK.name||"set name";
document.getElementById("lbme").onclick=askName;
document.getElementById("lbclose").onclick=()=>pl.style.display="none"})();(()=>{document.getElementById("mgo").onclick=startFromMenu;
document.getElementById("mrand").onclick=()=>{let av=Object.keys(TMETA).filter(k=>TOK[k]!==!1);
if(av.length){MENU.track=av[Math.floor(Math.random()*av.length)];drawMenu()}};
document.getElementById("mlaps").onchange=q=>MENU.laps=+q.target.value;
document.getElementById("mname").onclick=askName;
let bm=document.getElementById("btnMenu2");bm&&(bm.onclick=showMenu)})();(()=>{[...document.querySelectorAll("#cambar .cb")].forEach(c=>c.onclick=()=>setCam(c.dataset.m));
(()=>{let _pb=document.getElementById("pausebtn");if(_pb)_pb.onclick=togglePause})();
document.getElementById("focsel").onchange=q=>{CAM.focus=+q.target.value};
document.getElementById("mapwrap").onclick=()=>{BIGMAP=!0;document.getElementById("bigmap").style.display="flex";drawBig()};
document.getElementById("sndbtn")&&(document.getElementById("sndbtn").onclick=audToggle,document.getElementById("sndbtn").textContent=AUD.on?"♪ ON":"♪ OFF");document.getElementById("bmclose").onclick=()=>{BIGMAP=!1;document.getElementById("bigmap").style.display="none"};
})();window.MENU=MENU;window.TOK=TOK;window.raceAPI={startRace:v,menu:showMenu,board:golBoard,bet:BET,bank:BK,setTimeScale:t=>p.timeScale=t,get state(){return{phase:p.phase,t:p.t,order:p.order,seed:p.seed,finishOrder:st.slice(),T:p.T,track:O,timeScale:p.timeScale,leadS:b.length?Math.max(...b.map(q=>q.s)):0,lap:M?M.geom.LAP:0}},teams:q.map(t=>({tag:t.tag,name:t.name}))},fillFocus(),showMenu(),Mt()})();
