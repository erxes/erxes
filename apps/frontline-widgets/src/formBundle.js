"use strict";(()=>{var D=Object.defineProperty;var S=Object.getOwnPropertySymbols;var R=Object.prototype.hasOwnProperty,O=Object.prototype.propertyIsEnumerable;var k=(e,t,o)=>t in e?D(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,u=(e,t)=>{for(var o in t||(t={}))R.call(t,o)&&k(e,o,t[o]);if(S)for(var o of S(t))O.call(t,o)&&k(e,o,t[o]);return e};var l=(e,t,o)=>new Promise((s,r)=>{var n=i=>{try{a(o.next(i))}catch(m){r(m)}},d=i=>{try{a(o.throw(i))}catch(m){r(m)}},a=i=>i.done?s(i.value):Promise.resolve(i.value).then(n,d);a((o=o.apply(e,t)).next())});var v=`[id^='erxes-container'] {
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
`;var E=e=>localStorage.getItem(e);var _=document.createElement("style");_.textContent=v;document.head.appendChild(_);var P=()=>{let e=document.currentScript||(()=>{let t=document.getElementsByTagName("script");return t[t.length-1]})();return e&&e instanceof HTMLScriptElement?e.src.replace("/formBundle.js","/form"):""},T=P(),p=(e,t)=>{let o=window.Erxes||{};o[e]=t,window.Erxes=o},F=()=>l(void 0,null,function*(){if(window.location.hostname==="localhost")return{url:window.location.pathname,hostname:window.location.href,language:navigator.language,userAgent:navigator.userAgent,countryCode:"MN"};let e;try{e=yield(yield fetch("https://geo.erxes.io")).json()}catch(t){e={city:"",remoteAddress:"",region:"",country:"",countryCode:""}}return{remoteAddress:e.network,region:e.region,countryCode:e.countryCode,city:e.city,country:e.countryName,url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}}),q=(e,t)=>l(void 0,null,function*(){let{message:o,fromErxes:s,source:r,key:n,value:d}=e.data;if(s&&(t!=null&&t.contentWindow)&&(o==="requestingBrowserInfo"&&t.contentWindow.postMessage({fromPublisher:!0,source:r,message:"sendingBrowserInfo",browserInfo:yield F()},"*"),o==="setLocalStorageItem")){let a=JSON.parse(localStorage.getItem("erxes")||"{}");a[n]=d,localStorage.setItem("erxes",JSON.stringify(a))}}),w=document.createElement("meta");w.name="viewport";w.content="initial-scale=1, width=device-width";document.getElementsByTagName("head")[0].appendChild(w);var $=e=>{let t=e.form_id,o=`erxes-container-${t}`,s=`erxes-iframe-${t}`,r=document.getElementById(o);r||(r=document.createElement("div"),r.id=o);let n=document.getElementById(s);n||(n=document.createElement("iframe"),n.id=s,n.style.display="none",n.style.width="100%",n.style.margin="0 auto",n.style.height="100%",n.allowFullscreen=!0,n.allowTransparency=!0,n.style.background="transparent"),n.src=T,r.appendChild(n);let d=document.querySelector(`[data-erxes-embed="${t}"]`);return d?d.appendChild(r):document.body.appendChild(r),n.onload=()=>{var f;n.style.display="inherit",(f=n.contentDocument)!=null&&f.body&&(n.contentDocument.body.style.background="transparent",n.contentDocument.body.style.backgroundColor="transparent");let a=`[data-erxes-modal="${e.form_id}"]`,i=n.contentWindow;if(!i)return;let m=u({},e);m.onAction&&delete m.onAction,i.postMessage({fromPublisher:!0,hasPopupHandlers:document.querySelectorAll(a).length>0,settings:m,storage:E("erxes")},"*")},{container:r,iframe:n}},h=(e,t)=>{let o=Object.keys(c).find(n=>{let d=JSON.parse(n);return e===d.form_id});if(!o)return;let{iframe:s}=c[o],r=s.contentWindow;r&&r.postMessage(u({fromPublisher:!0,formId:e},t),"*")};p("showPopup",e=>{h(e,{action:"showPopup"})});p("callFormSubmit",e=>{h(e,{action:"callSubmit"})});p("sendExtraFormContent",(e,t)=>{h(e,{action:"extraFormContent",html:t})});var x=window.erxesSettings.forms||[],c={},C={},y=e=>JSON.stringify({form_id:e.form_id,channel_id:e.channel_id}),W=e=>x.find(t=>t.channel_id===e.channel_id&&t.form_id===e.form_id),M=e=>document.querySelectorAll(`[data-erxes-modal="${e.form_id}"]`).length>0,N=e=>{let t=y(e);c[t]||(c[t]=$(e))},L=()=>{x.forEach(e=>{(document.querySelector(`[data-erxes-embed="${e.form_id}"]`)||M(e))&&N(e)})},A=()=>{new MutationObserver(()=>{x.forEach(t=>{if(c[y(t)])return;(document.querySelector(`[data-erxes-embed="${t.form_id}"]`)||M(t))&&N(t)})}).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{L(),A()}):(L(),A());window.addEventListener("message",e=>l(void 0,null,function*(){let t=e.data||{},{fromErxes:o,source:s,message:r,settings:n}=t;if(!n||s!=="fromForms")return null;let{container:d,iframe:a}=c[y(n)]||{};q(e,a);let i=W(n);if(!i||!(o&&s==="fromForms"))return null;if(r==="submitResponse"&&i.onAction&&i.onAction(t),r==="connected"&&t.connectionInfo.widgetsLeadConnect.form.leadData.loadType==="popup"&&!C[n.form_id]&&(C[n.form_id]=!0,document.addEventListener("click",f=>{var g,b,I;(b=(g=f.target)==null?void 0:g.closest)!=null&&b.call(g,`[data-erxes-modal="${n.form_id}"]`)&&((I=a==null?void 0:a.contentWindow)==null||I.postMessage({fromPublisher:!0,action:"showPopup",formId:n.form_id},"*"))})),r==="changeContainerClass"&&d&&(d.className=t.className),r==="changeContainerStyle"&&a){let m=t.style.match(/height:\s*([\d.]+px)/);m&&(a.style.height=m[1])}return null}));})();
