(async function build(){
const fs=await import('node:fs/promises'),vm=await import('node:vm');
const dir=process.cwd(),read=p=>fs.readFile(dir+'/'+p,'utf8');
const app=await read('app.js'),styles=await read('styles.css'),gallery=await read('gallery.css'),bridge=await read('tilda/native-cart.js');
const assets={
'large-box-front.png':'tila6132-6237-4261-b263-326264643562/01-large-box-front.webp',
'large-box-spine.png':'tila6539-3931-4766-a433-326363386334/02-large-box-spine.webp',
'large-box-top.png':'tila3365-6364-4334-b831-653030636663/03-large-box-top.webp',
'small-box-front-print-hd.png':'tila3561-6363-4337-a636-323665633664/04-small-box-front-p.webp',
'small-box-side-print-hd.png':'tila6234-3431-4631-b337-306437303532/05-small-box-side-pr.webp',
'small-box-top-print.png':'tila6231-3430-4232-b338-393032336261/06-small-box-top-pri.webp'};
const map=s=>Object.entries(assets).reduce((v,[file,url])=>v.replaceAll('assets/'+file,'https://static.tildacdn.com/'+url),s);
const css=map(styles+'\n'+gallery);
const extra='.plrl-checkout{display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.plrl-status{font-size:13px;min-height:20px}.plrl-add[aria-disabled="true"]{opacity:.55;cursor:not-allowed}[hidden]{display:none!important}';
await fs.mkdir(dir+'/tilda/dist',{recursive:true});
for(const id of ['large','small']){
 const product={name:id==='large'?'Большой короб':'Маленький короб',size:id==='large'?'Большой':'Маленький'};
 const imagePath=id==='large'?'assets/large-set.webp':'assets/small-set.png';
 let image;
 try{const bytes=await fs.readFile(dir+'/'+imagePath);const mime=bytes[0]===137?'image/png':'image/webp';image='data:'+mime+';base64,'+bytes.toString('base64')}
 catch{image='__PHOTO_'+id.toUpperCase()+'__'}
 const vars={productId:id,product,otherId:id==='large'?'small':'large',productImages:['',image],IS_TILDA:true,MAX_QTY:99,money:()=>{throw Error('Fixed prices must not render in Tilda mode')}};
 const html=vm.runInNewContext(app.match(/root.innerHTML = (`[\s\S]*?`);/)[1],vars);
 const panels=vm.runInNewContext('('+app.match(/const panels = (\{[\s\S]*?\n    \});/)[1]+')',vars);
 const media=html.slice(html.indexOf('<div class="pdp-media">'),html.indexOf('<div class="pdp-info">'));
 const tabMarkup='<section class="tabs-wrap"><div class="tabs" role="tablist" aria-label="Информация о товаре">'+[['about','О товаре'],['specs','Характеристики'],['docs','Документы']].map(([key,label],i)=>'<button type="button" class="tab'+(i?'':' active')+'" role="tab" data-tab="'+key+'" id="tab-'+key+'" aria-controls="panel-'+key+'" aria-selected="'+(!i)+'" tabindex="'+(i?-1:0)+'">'+label+'</button>').join('')+'</div>'+Object.entries(panels).map(([key,text],i)=>'<div class="tab-panel" id="panel-'+key+'" role="tabpanel" tabindex="0" aria-labelledby="tab-'+key+'"'+(i?' hidden':'')+'>'+text+'</div>').join('')+'</section>';
 const hero=html.slice(0,html.indexOf('<section class="tabs-wrap">')).replace('class="pdp-media"','class="pdp-media plrl-product-gallery"')+'</main>';
 const head='<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+product.name+' — Большая лапта в ударе</title><style>'+css+extra+'</style></head>';
 await fs.writeFile(dir+'/tilda/dist/'+id+'-zero.html',head+'<body data-product="'+id+'">'+hero+'</body></html>');
 const shadowCss=css.replaceAll(':root',':host').replace(/body\[data-product="(.*?)"\]/g,':host([data-product="$1"])')+extra+'\n:host{display:block;font-family:Manrope,Arial,sans-serif;color:#18261f}.pdp-gallery{width:100%;box-sizing:border-box}.tabs-wrap{max-width:1200px;margin:auto;padding:24px 20px}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}';
 const runtime=`
${bridge}
(function(){
const id=${JSON.stringify(id)},record=${JSON.stringify(id==='large'?'rec5905398501':'rec5907133401')};
function run(){
 const scope=document.getElementById(record);if(!scope)return;
 window.PLRLTilda.mount(scope,id);
 const host=scope.querySelector('.plrl-product-gallery');
 if(host&&!host.shadowRoot){
 const root=host.attachShadow({mode:'open'});root.innerHTML=${JSON.stringify('<style>'+shadowCss+'</style>'+media)};
 const slides=[...root.querySelectorAll('[data-gallery-slide]')],thumbs=[...root.querySelectorAll('[data-gallery-index]')];let index=0;
 function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>{s.hidden=i!==index;s.classList.toggle('is-active',i===index)});thumbs.forEach((t,i)=>{t.classList.toggle('active',i===index);t.setAttribute('aria-pressed',String(i===index))})}
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.galleryIndex!==undefined)show(Number(b.dataset.galleryIndex));if(b.dataset.galleryStep)show(index+Number(b.dataset.galleryStep))});show(0);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();`;
 await fs.writeFile(dir+'/tilda/dist/'+id+'-runtime-t123.html','<script>'+runtime+'</script>');
 const tag='plrl-tabs-'+id;
 const tabs='<'+tag+'></'+tag+'><script>(()=>{const tag='+JSON.stringify(tag)+';if(customElements.get(tag))return;customElements.define(tag,class extends HTMLElement{connectedCallback(){if(this.shadowRoot)return;const root=this.attachShadow({mode:"open"});root.innerHTML='+JSON.stringify('<style>'+shadowCss+'</style>'+tabMarkup)+`;const buttons=[...root.querySelectorAll('[role=tab]')],panels=[...root.querySelectorAll('[role=tabpanel]')];function show(n,focus){buttons.forEach((b,i)=>{b.classList.toggle('active',i===n);b.tabIndex=i===n?0:-1;b.setAttribute('aria-selected',String(i===n));panels[i].hidden=i!==n});if(focus)buttons[n].focus()}buttons.forEach((b,i)=>{b.addEventListener('click',()=>show(i));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;else if(e.key==='ArrowLeft')n=(i+2)%3;else if(e.key==='Home')n=0;else if(e.key==='End')n=2;else return;e.preventDefault();show(n,true)})})}})})();</script>`;
 await fs.writeFile(dir+'/tilda/dist/'+id+'-tabs-t123.html',tabs);
}
return 'Built 6 files';
})().then(console.log);
