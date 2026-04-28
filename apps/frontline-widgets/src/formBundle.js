"use strict";(()=>{var A=Object.defineProperty;var b=Object.getOwnPropertySymbols;var M=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var I=(e,t,n)=>t in e?A(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,g=(e,t)=>{for(var n in t||(t={}))M.call(t,n)&&I(e,n,t[n]);if(b)for(var n of b(t))B.call(t,n)&&I(e,n,t[n]);return e};var c=(e,t,n)=>new Promise((d,r)=>{var o=i=>{try{a(n.next(i))}catch(m){r(m)}},s=i=>{try{a(n.throw(i))}catch(m){r(m)}},a=i=>i.done?d(i.value):Promise.resolve(i.value).then(o,s);a((n=n.apply(e,t)).next())});var S=`[id^='erxes-container'] {
  z-index: 1000000000;
  border: none;
}

[id^='erxes-container'] > iframe {
  border: none;
}
[id^='erxes-container'] > html,
body {
  background-color: transparent !important;
  background: transparent !important;
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
`;var k=e=>localStorage.getItem(e);var C=document.createElement("style");C.textContent=S;document.head.appendChild(C);var P=()=>{let e=document.currentScript||(()=>{let t=document.getElementsByTagName("script");return t[t.length-1]})();return e&&e instanceof HTMLScriptElement?e.src.replace("/formBundle.js","/form"):""},R=P(),p=(e,t)=>{let n=window.Erxes||{};n[e]=t,window.Erxes=n},T=()=>c(void 0,null,function*(){if(window.location.hostname==="localhost")return{url:window.location.pathname,hostname:window.location.href,language:navigator.language,userAgent:navigator.userAgent,countryCode:"MN"};let e;try{e=yield(yield fetch("https://geo.erxes.io")).json()}catch(t){e={city:"",remoteAddress:"",region:"",country:"",countryCode:""}}return{remoteAddress:e.network,region:e.region,countryCode:e.countryCode,city:e.city,country:e.countryName,url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}}),q=(e,t)=>c(void 0,null,function*(){let{message:n,fromErxes:d,source:r,key:o,value:s}=e.data;if(d&&(t!=null&&t.contentWindow)&&(n==="requestingBrowserInfo"&&t.contentWindow.postMessage({fromPublisher:!0,source:r,message:"sendingBrowserInfo",browserInfo:yield T()},"*"),n==="setLocalStorageItem")){let a=JSON.parse(localStorage.getItem("erxes")||"{}");a[o]=s,localStorage.setItem("erxes",JSON.stringify(a))}}),w=document.createElement("meta");w.name="viewport";w.content="initial-scale=1, width=device-width";document.getElementsByTagName("head")[0].appendChild(w);var F=e=>{let t=e.form_id,n=`erxes-container-${t}`,d=`erxes-iframe-${t}`,r=document.getElementById(n);r||(r=document.createElement("div"),r.id=n);let o=document.getElementById(d);o||(o=document.createElement("iframe"),o.id=d,o.style.display="none",o.style.width="100%",o.style.margin="0 auto",o.style.height="100%",o.allowFullscreen=!0,o.allowTransparency=!0,o.style.background="transparent"),o.src=R,r.appendChild(o);let s=document.querySelector(`[data-erxes-embed="${t}"]`);return console.log("embedContainer",s),s?s.appendChild(r):document.body.appendChild(r),o.onload=()=>{var f;o.style.display="inherit",(f=o.contentDocument)!=null&&f.body&&(o.contentDocument.body.style.background="transparent");let a=`[data-erxes-modal="${e.form_id}"]`,i=o.contentWindow;if(!i)return;let m=g({},e);m.onAction&&delete m.onAction,i.postMessage({fromPublisher:!0,hasPopupHandlers:document.querySelectorAll(a).length>0,settings:m,storage:k("erxes")},"*")},{container:r,iframe:o}},h=(e,t)=>{let n=Object.keys(l).find(o=>{let s=JSON.parse(o);return e===s.form_id});if(!n)return;let{iframe:d}=l[n],r=d.contentWindow;r&&r.postMessage(g({fromPublisher:!0,formId:e},t),"*")};p("showPopup",e=>{h(e,{action:"showPopup"})});p("callFormSubmit",e=>{h(e,{action:"callSubmit"})});p("sendExtraFormContent",(e,t)=>{h(e,{action:"extraFormContent",html:t})});var x=window.erxesSettings.forms||[],l={},L=e=>JSON.stringify({form_id:e.form_id,channel_id:e.channel_id}),D=e=>x.find(t=>t.channel_id===e.channel_id&&t.form_id===e.form_id),O=e=>document.querySelectorAll(`[data-erxes-modal="${e.form_id}"]`).length>0,_=e=>{let t=L(e);l[t]||(l[t]=F(e))},v=()=>{x.forEach(e=>{(document.querySelector(`[data-erxes-embed="${e.form_id}"]`)||O(e))&&_(e)})},E=()=>{new MutationObserver(()=>{x.forEach(t=>{document.querySelector(`[data-erxes-embed="${t.form_id}"]`)&&_(t)})}).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{v(),E()}):(v(),E());window.addEventListener("message",e=>c(void 0,null,function*(){let t=e.data||{},{fromErxes:n,source:d,message:r,settings:o}=t;if(!o||d!=="fromForms")return null;let{container:s,iframe:a}=l[L(o)]||{};q(e,a);let i=D(o);if(!i||!(n&&d==="fromForms"))return null;if(r==="submitResponse"&&i.onAction&&i.onAction(t),r==="connected"&&t.connectionInfo.widgetsLeadConnect.form.leadData.loadType==="popup"){let f=`[data-erxes-modal="${o.form_id}"]`,y=document.querySelectorAll(f);for(let u=0;u<y.length;u++)y[u].addEventListener("click",()=>{a==null||a.contentWindow.postMessage({fromPublisher:!0,action:"showPopup",formId:o.form_id},"*")})}if(r==="changeContainerClass"&&s&&(s.className=t.className),r==="changeContainerStyle"&&a){let m=t.style.match(/height:\s*([\d.]+px)/);m&&(a.style.height=m[1])}return null}));})();
