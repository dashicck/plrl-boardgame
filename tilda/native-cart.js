/* PLRL: delegate to a Tilda product block synced with Catalogue. No cart storage or private APIs. */
(function(global){
'use strict';
function readNative(source){
 if(!source)return null;
 const links=Array.from(source.querySelectorAll('a[href^="#order:"]'));
 if(links.length!==1)return null;
 const button=links[0];
 if(button.matches(':disabled,[aria-disabled="true"],.disabled'))return null;
 const order=button.getAttribute('href').split(':::')[0];
 const amount=order.slice(order.lastIndexOf('=')+1).replace(/[\s\u00a0]/g,'').replace(',','.');
 if(!/^\d+(\.\d{1,2})?$/.test(amount))return null;
 const price=Number(amount);if(!Number.isFinite(price)||price<=0)return null;
 const inputs=Array.from(source.querySelectorAll('input[type="number"]'));
 if(inputs.length>1)return null;
 return {button,price,quantity:inputs[0]||null};
}
function quantity(value){return Math.min(99,Math.max(1,Math.floor(Number(value)||1)))}
function mount(root,id){
 if(!root||root.dataset.plrlBound==='true')return;
 if(id!=='large'&&id!=='small')throw Error('Unknown PLRL product');
 root.dataset.plrlBound='true';
 const doc=root.ownerDocument,view=doc.defaultView;
 const sourceSelector='.plrl-native-'+id;
 const find=()=>{const sources=doc.querySelectorAll(sourceSelector);return sources.length===1?readNative(sources[0]):null};
 const one=(a,b)=>root.querySelector(a)||root.querySelector(b);
 const add=one('[data-add]','.plrl-add');
 const price=one('.plrl-price .tn-atom','.plrl-price');
 const input=one('#qty','.plrl-quantity input');
 const minus=one('[data-minus]','.plrl-minus'),plus=one('[data-plus]','.plrl-plus');
 const status=one('[data-plrl-status]','.plrl-status .tn-atom');
 const say=t=>{if(status)status.textContent=t};
 function refresh(){
  const native=find(),ready=!!native;
  if(add){if(add.getAttribute('aria-disabled')!==String(!ready))add.setAttribute('aria-disabled',String(!ready));if('disabled' in add&&add.disabled===ready)add.disabled=!ready}
  if(price){const value=ready?new Intl.NumberFormat('ru-RU').format(native.price)+' ₽':'Цена загружается';if(price.textContent!==value)price.textContent=value}
  if(input&&input.disabled===!!native?.quantity)input.disabled=!native?.quantity;
  for(const b of [minus,plus])if(b){b.setAttribute('aria-disabled',String(!native?.quantity));if('disabled' in b&&b.disabled===!!native?.quantity)b.disabled=!native?.quantity}
  if(native&&!native.quantity&&input)input.value='1';
  const text=ready?'':'Покупка пока недоступна.';
  if(status&&status.textContent!==text)status.textContent=text;
 }
 function step(delta){const n=find();if(!n?.quantity||!input)return;input.value=String(quantity(Number(input.value)+delta))}
 minus?.addEventListener('click',e=>{e.preventDefault();step(-1)});
 plus?.addEventListener('click',e=>{e.preventDefault();step(1)});
 input?.addEventListener('change',()=>{input.value=String(quantity(input.value))});
 let busy=false;
 add?.addEventListener('click',e=>{
  e.preventDefault();
  const native=find();
  if(!native||busy){if(!native)say('Покупка пока недоступна.');return}
  const qty=quantity(input?.value||1);
  if(qty>1&&!native.quantity){say('Количество можно изменить в корзине.');return}
  if(native.quantity){
   native.quantity.value=String(qty);
   native.quantity.dispatchEvent(new view.Event('input',{bubbles:true}));
   native.quantity.dispatchEvent(new view.Event('change',{bubbles:true}));
   // Native constraints and stock changes remain authoritative.
   if(native.quantity.checkValidity&&!native.quantity.checkValidity()){native.quantity.reportValidity?.();return}
  }
  busy=true;
  try{native.button.click()}finally{view.setTimeout(()=>{busy=false;refresh()},300)}
  // Tilda owns success feedback. A click is not proof of a successful cart update.
 });
 refresh();
 let scheduled=false;
 const observer=new view.MutationObserver(()=>{
  if(scheduled)return;scheduled=true;
  view.requestAnimationFrame(()=>{scheduled=false;refresh()});
 });
 observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href','disabled','class'],characterData:true});
 // Do not observe our own accessibility changes indefinitely.
 view.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 return {refresh,disconnect:()=>observer.disconnect()};
}
const api={readNative,quantity,mount};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(global)global.PLRLTilda=api;
})(typeof window==='undefined'?null:window);
