"use strict";(()=>{var D=Object.defineProperty;var S=Object.getOwnPropertySymbols;var N=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var k=(t,e,n)=>e in t?D(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,g=(t,e)=>{for(var n in e||(e={}))N.call(e,n)&&k(t,n,e[n]);if(S)for(var n of S(e))B.call(e,n)&&k(t,n,e[n]);return t};var p=(t,e,n)=>new Promise((m,r)=>{var o=a=>{try{s(n.next(a))}catch(d){r(d)}},i=a=>{try{s(n.throw(a))}catch(d){r(d)}},s=a=>a.done?m(a.value):Promise.resolve(a.value).then(o,i);s((n=n.apply(t,e)).next())});var E=`[id^='erxes-container'] {
  z-index: 1000000000;
  border: none;
}

[id^='erxes-container'] > iframe {
  border: none;
}

/*loader*/
[data-erxes-embed] {
  position: relative;
  background: transparent;
  border-radius: 4px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
}

.hidden {
  display: none !important;
}

@media only screen and (max-width: 420px) {
  [id^='erxes-container'] {
    width: 100%;
    max-height: none;
  }

  [id^='erxes-iframe'] {
    bottom: 0;
    right: 0;
  }
}

.erxes-modal-iframe {
  position: fixed; /* Stay in place */
  z-index: 1000000; /* Sit on top */
  left: 0;
  top: 0;
  bottom: 0;
  min-width: 100%; /* Full width */
  border: none;
  height: 100% !important;
}

.erxes-modal-iframe > iframe,
.erxes-slide-right-iframe > iframe,
.erxes-slide-left-iframe > iframe,
.erxes-dropdown-iframe > iframe,
.erxes-shoutbox-iframe > iframe {
  height: 100%;
}

.erxes-slide-right-iframe,
.erxes-slide-left-iframe {
  position: fixed;
  bottom: 5px;
  border-radius: 10px;
  width: 380px;
  max-height: 100%;
  max-height: calc(100% - 10px);
  animation-delay: 1s;
  -webkit-animation-delay: 1s;
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  box-shadow: 0 3px 20px 0px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* slide in left */
.erxes-slide-left-iframe {
  left: 5px;
  animation: fadeInLeft 0.3s;
  -webkit-animation: fadeInLeft 0.3s;
}

/* slide in right */
.erxes-slide-right-iframe {
  right: 5px;
  animation: fadeInRight 0.3s;
  -webkit-animation: fadeInRight 0.3s;
}

/* embeded form */
.erxes-embedded-iframe {
  position: initial !important;
  margin: 0 auto;
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 3px 18px -2px rgba(0, 0, 0, 0.2);
}

/* dropdown */
.erxes-dropdown-iframe {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  animation-delay: 1s;
  -webkit-animation-delay: 1s;
  animation: fadeInDown;
  -webkit-animation: fadeInDown;
  -webkit-animation-duration: 0.3s;
  animation-duration: 0.3s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  max-height: 100%;
  box-shadow: 0 3px 20px -2px rgba(0, 0, 0, 0.3);
}

/* shoutbox */
.erxes-shoutbox-iframe {
  position: fixed;
  bottom: 0px;
  right: 0px;
  width: 416px;
  height: 100%;
  max-height: 100%;
  max-height: calc(100% - 10px);
}

.erxes-shoutbox-iframe.erxes-hidden {
  width: 96px;
}

/* animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes fadeInDown {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.fadeInDown {
  -webkit-animation-name: fadeInDown;
  animation-name: fadeInDown;
}

@-webkit-keyframes fadeInLeft {
  from {
    opacity: 0;
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    -webkit-transform: translate3d(-100%, 0, 0);
    transform: translate3d(-100%, 0, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.fadeInLeft {
  -webkit-animation-name: fadeInLeft;
  animation-name: fadeInLeft;
}

@-webkit-keyframes fadeInRight {
  from {
    opacity: 0;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.fadeInRight {
  -webkit-animation-name: fadeInRight;
  animation-name: fadeInRight;
}
`;var v=t=>localStorage.getItem(t);var T=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),L=(t,e)=>{let{message:n,fromErxes:m,source:r,key:o,value:i}=t.data||{};if(!(!m||!(e!=null&&e.contentWindow))&&(n==="requestingBrowserInfo"&&e.contentWindow.postMessage({fromPublisher:!0,source:r,message:"sendingBrowserInfo",browserInfo:T()},"*"),n==="setLocalStorageItem")){let s=JSON.parse(localStorage.getItem("erxes")||"{}");s[o]=i,localStorage.setItem("erxes",JSON.stringify(s))}};var M=document.createElement("style");M.textContent=E;document.head.appendChild(M);var q=()=>{let t=document.currentScript||(()=>{let e=document.getElementsByTagName("script");return e[e.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("/formBundle.js","/form"):""},P=q(),u=(t,e)=>{let n=window.Erxes||{};n[t]=e,window.Erxes=n},h=window.__erxesFormsGlobal=window.__erxesFormsGlobal||{iframesMapping:{},popupHandlersAttached:{},initialized:!1},{iframesMapping:c,popupHandlersAttached:_}=h,x=()=>window.erxesSettings.forms||[],H=t=>{let e=t.form_id,n=`erxes-container-${e}`,m=`erxes-iframe-${e}`,r=document.getElementById(n);r||(r=document.createElement("div"),r.id=n);let o=document.getElementById(m);o||(o=document.createElement("iframe"),o.id=m,o.style.display="none",o.style.width="100%",o.style.margin="0 auto",o.style.height="100%",o.allowFullscreen=!0,o.allowTransparency=!0,o.style.background="transparent"),o.src=P,r.appendChild(o);let i=document.querySelector(`[data-erxes-embed="${e}"]`);return i?i.appendChild(r):document.body.appendChild(r),o.onload=()=>{var l;o.style.display="inherit",(l=o.contentDocument)!=null&&l.body&&(o.contentDocument.body.style.background="transparent",o.contentDocument.body.style.backgroundColor="transparent");let s=`[data-erxes-modal="${t.form_id}"]`,a=o.contentWindow;if(!a)return;let d=g({},t);d.onAction&&delete d.onAction,a.postMessage({fromPublisher:!0,hasPopupHandlers:document.querySelectorAll(s).length>0,settings:d,storage:v("erxes")},"*")},{container:r,iframe:o}},w=(t,e)=>{let n=Object.keys(c).find(o=>{let i=JSON.parse(o);return t===i.form_id});if(!n)return;let{iframe:m}=c[n],r=m.contentWindow;r&&r.postMessage(g({fromPublisher:!0,formId:t},e),"*")},b=t=>JSON.stringify({form_id:t.form_id,channel_id:t.channel_id}),$=t=>x().find(e=>e.channel_id===t.channel_id&&e.form_id===t.form_id),A=t=>document.querySelectorAll(`[data-erxes-modal="${t.form_id}"]`).length>0,R=t=>{let e=b(t);c[e]||(c[e]=H(t))},W=()=>{x().forEach(t=>{(document.querySelector(`[data-erxes-embed="${t.form_id}"]`)||A(t))&&R(t)})},V=()=>{new MutationObserver(()=>{x().forEach(e=>{if(c[b(e)])return;(document.querySelector(`[data-erxes-embed="${e.form_id}"]`)||A(e))&&R(e)})}).observe(document.body,{childList:!0,subtree:!0})},C=()=>{if(!h.initialized){h.initialized=!0;let t=document.createElement("meta");t.name="viewport",t.content="initial-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(t),u("showPopup",e=>{w(e,{action:"showPopup"})}),u("callFormSubmit",e=>{w(e,{action:"callSubmit"})}),u("sendExtraFormContent",(e,n)=>{w(e,{action:"extraFormContent",html:n})}),V(),window.addEventListener("message",e=>p(void 0,null,function*(){let n=e.data||{},{fromErxes:m,source:r,message:o,settings:i}=n;if(!i||r!=="fromForms")return null;let{container:s,iframe:a}=c[b(i)]||{};L(e,a);let d=$(i);if(!d||!(m&&r==="fromForms"))return null;if(o==="submitResponse"&&d.onAction&&d.onAction(n),o==="connected"&&n.connectionInfo.widgetsLeadConnect.form.leadData.loadType==="popup"&&!_[i.form_id]&&(_[i.form_id]=!0,document.addEventListener("click",F=>{var f,y,I;(y=(f=F.target)==null?void 0:f.closest)!=null&&y.call(f,`[data-erxes-modal="${i.form_id}"]`)&&((I=a==null?void 0:a.contentWindow)==null||I.postMessage({fromPublisher:!0,action:"showPopup",formId:i.form_id},"*"))})),o==="changeContainerClass"&&s&&(s.className=n.className),o==="changeContainerStyle"&&a){let l=n.style.match(/height:\s*([\d.]+px)/);l&&(a.style.height=l[1])}return null}))}W()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C();})();
