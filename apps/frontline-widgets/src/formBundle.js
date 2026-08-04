"use strict";(()=>{var B=Object.defineProperty,O=Object.defineProperties;var T=Object.getOwnPropertyDescriptors;var k=Object.getOwnPropertySymbols;var P=Object.prototype.hasOwnProperty,q=Object.prototype.propertyIsEnumerable;var E=(t,e,n)=>e in t?B(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,f=(t,e)=>{for(var n in e||(e={}))P.call(e,n)&&E(t,n,e[n]);if(k)for(var n of k(e))q.call(e,n)&&E(t,n,e[n]);return t},v=(t,e)=>O(t,T(e));var g=(t,e,n)=>new Promise((m,r)=>{var o=a=>{try{s(n.next(a))}catch(d){r(d)}},i=a=>{try{s(n.throw(a))}catch(d){r(d)}},s=a=>a.done?m(a.value):Promise.resolve(a.value).then(o,i);s((n=n.apply(t,e)).next())});var C=`[id^='erxes-container'] {
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
`;var A=t=>localStorage.getItem(t);var p=null,$=()=>g(void 0,null,function*(){if(window.location.hostname==="localhost")return{url:window.location.pathname,hostname:window.location.href,language:navigator.language,userAgent:navigator.userAgent,countryCode:"MN"};if(!p)try{let e=yield(yield fetch("https://geo.erxes.io")).json();p={remoteAddress:e.network,region:e.region,countryCode:e.countryCode,city:e.city,country:e.countryName}}catch(t){p={city:"",remoteAddress:"",region:"",country:"",countryCode:""}}return v(f({},p),{url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent})}),L=(t,e)=>g(void 0,null,function*(){let{message:n,fromErxes:m,source:r,key:o,value:i}=t.data||{};if(!(!m||!(e!=null&&e.contentWindow))&&(n==="requestingBrowserInfo"&&e.contentWindow.postMessage({fromPublisher:!0,source:r,message:"sendingBrowserInfo",browserInfo:yield $()},"*"),n==="setLocalStorageItem")){let s=JSON.parse(localStorage.getItem("erxes")||"{}");s[o]=i,localStorage.setItem("erxes",JSON.stringify(s))}});var R=document.createElement("style");R.textContent=C;document.head.appendChild(R);var W=()=>{let t=document.currentScript||(()=>{let e=document.getElementsByTagName("script");return e[e.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("/formBundle.js","/form"):""},V=W(),w=(t,e)=>{let n=window.Erxes||{};n[t]=e,window.Erxes=n},x=window.__erxesFormsGlobal=window.__erxesFormsGlobal||{iframesMapping:{},popupHandlersAttached:{},initialized:!1},{iframesMapping:c,popupHandlersAttached:_}=x,y=()=>window.erxesSettings.forms||[],z=t=>{let e=t.form_id,n=`erxes-container-${e}`,m=`erxes-iframe-${e}`,r=document.getElementById(n);r||(r=document.createElement("div"),r.id=n);let o=document.getElementById(m);o||(o=document.createElement("iframe"),o.id=m,o.style.display="none",o.style.width="100%",o.style.margin="0 auto",o.style.height="100%",o.allowFullscreen=!0,o.allowTransparency=!0,o.style.background="transparent"),o.src=V,r.appendChild(o);let i=document.querySelector(`[data-erxes-embed="${e}"]`);return i?i.appendChild(r):document.body.appendChild(r),o.onload=()=>{var l;o.style.display="inherit",(l=o.contentDocument)!=null&&l.body&&(o.contentDocument.body.style.background="transparent",o.contentDocument.body.style.backgroundColor="transparent");let s=`[data-erxes-modal="${t.form_id}"]`,a=o.contentWindow;if(!a)return;let d=f({},t);d.onAction&&delete d.onAction,a.postMessage({fromPublisher:!0,hasPopupHandlers:document.querySelectorAll(s).length>0,settings:d,storage:A("erxes")},"*")},{container:r,iframe:o}},h=(t,e)=>{let n=Object.keys(c).find(o=>{let i=JSON.parse(o);return t===i.form_id});if(!n)return;let{iframe:m}=c[n],r=m.contentWindow;r&&r.postMessage(f({fromPublisher:!0,formId:t},e),"*")},b=t=>JSON.stringify({form_id:t.form_id,channel_id:t.channel_id}),J=t=>y().find(e=>e.channel_id===t.channel_id&&e.form_id===t.form_id),F=t=>document.querySelectorAll(`[data-erxes-modal="${t.form_id}"]`).length>0,N=t=>{let e=b(t);c[e]||(c[e]=z(t))},G=()=>{y().forEach(t=>{(document.querySelector(`[data-erxes-embed="${t.form_id}"]`)||F(t))&&N(t)})},j=()=>{new MutationObserver(()=>{y().forEach(e=>{if(c[b(e)])return;(document.querySelector(`[data-erxes-embed="${e.form_id}"]`)||F(e))&&N(e)})}).observe(document.body,{childList:!0,subtree:!0})},M=()=>{if(!x.initialized){x.initialized=!0;let t=document.createElement("meta");t.name="viewport",t.content="initial-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(t),w("showPopup",e=>{h(e,{action:"showPopup"})}),w("callFormSubmit",e=>{h(e,{action:"callSubmit"})}),w("sendExtraFormContent",(e,n)=>{h(e,{action:"extraFormContent",html:n})}),j(),window.addEventListener("message",e=>g(void 0,null,function*(){let n=e.data||{},{fromErxes:m,source:r,message:o,settings:i}=n;if(!i||r!=="fromForms")return null;let{container:s,iframe:a}=c[b(i)]||{};L(e,a);let d=J(i);if(!d||!(m&&r==="fromForms"))return null;if(o==="submitResponse"&&d.onAction&&d.onAction(n),o==="connected"&&n.connectionInfo.widgetsLeadConnect.form.leadData.loadType==="popup"&&!_[i.form_id]&&(_[i.form_id]=!0,document.addEventListener("click",D=>{var u,I,S;(I=(u=D.target)==null?void 0:u.closest)!=null&&I.call(u,`[data-erxes-modal="${i.form_id}"]`)&&((S=a==null?void 0:a.contentWindow)==null||S.postMessage({fromPublisher:!0,action:"showPopup",formId:i.form_id},"*"))})),o==="changeContainerClass"&&s&&(s.className=n.className),o==="changeContainerStyle"&&a){let l=n.style.match(/height:\s*([\d.]+px)/);l&&(a.style.height=l[1])}return null}))}G()};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",M):M();})();
