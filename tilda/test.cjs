(async function test(){
const fs=await import('node:fs/promises'),vm=await import('node:vm'),assert=(await import('node:assert/strict')).default;
const dir=process.cwd();const script=await fs.readFile(dir+'/tilda/native-cart.js','utf8');
const module={exports:{}};vm.runInNewContext(script,{module});const api=module.exports;let checks=0;
function ok(fn){fn();checks++}
function button(href,disabled=false){return {href,disabled,clicks:0,matches(){return this.disabled},getAttribute(){return this.href},click(){this.clicks++}}}
function source(b,inputs=[]){return {querySelectorAll(q){return q.startsWith('a[')?b:inputs}}}
ok(()=>assert.equal(api.readNative(null),null));
ok(()=>assert.equal(api.readNative(source([])),null));
ok(()=>assert.equal(api.readNative(source([button('#order:A=699'),button('#order:B=1299')])),null));
ok(()=>assert.equal(api.readNative(source([button('#order:A=699',true)])),null));
ok(()=>assert.equal(api.readNative(source([button('#order:A=NaN')])),null));
ok(()=>assert.equal(api.readNative(source([button('#order:A=0')])),null));
ok(()=>assert.equal(api.readNative(source([button('#order:A=1 299:::image=https://example.com/a.png')])).price,1299));
ok(()=>assert.equal(api.readNative(source([button('#order:A=699,50')])).price,699.5));
ok(()=>assert.equal(api.quantity(-9),1));ok(()=>assert.equal(api.quantity(900),99));ok(()=>assert.equal(api.quantity('2.7'),2));
function control(){return {attributes:{},listeners:{},disabled:true,textContent:'',value:'1',setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},addEventListener(k,fn){this.listeners[k]=fn}}}
const add=control(),price=control(),input=control(),minus=control(),plus=control(),status=control();
let sources=[],observers=0,disconnects=0;const timers=[];
const view={Event:class{constructor(type){this.type=type}},MutationObserver:class{constructor(fn){this.fn=fn;observers++}observe(){}disconnect(){disconnects++}},requestAnimationFrame:f=>f(),setTimeout:f=>timers.push(f),addEventListener(){}};
const doc={defaultView:view,body:{},querySelectorAll:()=>sources};
const map={'[data-add]':add,'.plrl-price':price,'#qty':input,'[data-minus]':minus,'[data-plus]':plus,'[data-plrl-status]':status};
const root={dataset:{},ownerDocument:doc,querySelector:q=>map[q]||null};
const instance=api.mount(root,'large');
ok(()=>assert.equal(add.disabled,true));ok(()=>assert.equal(price.textContent,'Цена загружается'));
ok(()=>{api.mount(root,'large');assert.equal(observers,1)});
let nativeButton=button('#order:Большой=1299'),nativeInput={value:'1',events:[],dispatchEvent(e){this.events.push(e.type)},checkValidity:()=>true};
sources=[source([nativeButton],[nativeInput])];instance.refresh();
ok(()=>assert.equal(add.disabled,false));
ok(()=>assert.equal(price.textContent.replace(/\s/g,''),'1299₽'));
plus.listeners.click({preventDefault(){}});plus.listeners.click({preventDefault(){}});
add.listeners.click({preventDefault(){}});add.listeners.click({preventDefault(){}});
ok(()=>assert.equal(nativeButton.clicks,1));
ok(()=>assert.equal(nativeInput.value,'3'));
ok(()=>assert.equal(nativeInput.events.join(','),'input,change'));
timers.splice(0).forEach(f=>f());nativeButton.href='#order:Большой=1500';instance.refresh();
ok(()=>assert.equal(price.textContent.replace(/\s/g,''),'1500₽'));
nativeButton.disabled=true;instance.refresh();add.listeners.click({preventDefault(){}});
ok(()=>assert.equal(nativeButton.clicks,1));
sources=[];instance.refresh();ok(()=>assert.equal(add.disabled,true));
instance.disconnect();ok(()=>assert.equal(disconnects,1));
for(const id of ['large','small']){
 const html=await fs.readFile(dir+'/'+id+'.html','utf8');
 ok(()=>assert.ok(html.includes('data-commerce="tilda"')&&!html.includes('reviews.js')));
 for(const file of [id+'-runtime-t123.html',id+'-tabs-t123.html']){
  const content=await fs.readFile(dir+'/tilda/dist/'+file,'utf8');
  for(const [,js]of content.matchAll(/<script>([\s\S]*?)<\/script>/g))ok(()=>{new vm.Script(js)});
 }
 const htmlExport=await fs.readFile(dir+'/tilda/dist/'+id+'-zero.html','utf8');
 ok(()=>assert.ok(htmlExport.includes('href="#opencart"')&&!htmlExport.includes('checkout.html')));
}
const app=await fs.readFile(dir+'/app.js','utf8');
ok(()=>{new vm.Script(app)});
const checkoutHandler=app.slice(app.indexOf("$('[data-fast]'"),app.indexOf('  function renderCheckout'));
ok(()=>assert.ok(!checkoutHandler.includes('addToCart')));
ok(()=>assert.ok(!/localStorage|sessionStorage|fetch\(|tcart__/.test(script)));
return {checks,status:'PASS',scope:'Unit tests and generated script syntax. Tilda UI/import/native cart not tested.'};
})().then(console.log);
