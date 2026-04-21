"use strict";(()=>{var _=Object.defineProperty;var y=Object.getOwnPropertySymbols;var M=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable;var b=(e,t,n)=>t in e?_(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,f=(e,t)=>{for(var n in t||(t={}))M.call(t,n)&&b(e,n,t[n]);if(y)for(var n of y(t))B.call(t,n)&&b(e,n,t[n]);return e};var l=(e,t,n)=>new Promise((d,r)=>{var o=i=>{try{a(n.next(i))}catch(m){r(m)}},s=i=>{try{a(n.throw(i))}catch(m){r(m)}},a=i=>i.done?d(i.value):Promise.resolve(i.value).then(o,s);a((n=n.apply(e,t)).next())});var I=`[id^='erxes-container'] {
  z-index: 1000000000;
  border: none;
}

[id^='erxes-container'] > iframe {
  border: none;
}

/*loader*/
[data-erxes-embed] {
  position: relative;
  background: rgba(0, 0, 0, 0.03);
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
`;var S=e=>localStorage.getItem(e);var E=document.createElement("style");E.textContent=I;document.head.appendChild(E);var R=()=>{let e=document.currentScript||(()=>{let t=document.getElementsByTagName("script");return t[t.length-1]})();return e&&e instanceof HTMLScriptElement?e.src.replace("/formBundle.js","/form"):""},P=R(),p=(e,t)=>{let n=window.Erxes||{};n[e]=t,window.Erxes=n},T=()=>l(void 0,null,function*(){if(window.location.hostname==="localhost")return{url:window.location.pathname,hostname:window.location.href,language:navigator.language,userAgent:navigator.userAgent,countryCode:"MN"};let e;try{e=yield(yield fetch("https://geo.erxes.io")).json()}catch(t){e={city:"",remoteAddress:"",region:"",country:"",countryCode:""}}return{remoteAddress:e.network,region:e.region,countryCode:e.countryCode,city:e.city,country:e.countryName,url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}}),F=(e,t)=>l(void 0,null,function*(){let{message:n,fromErxes:d,source:r,key:o,value:s}=e.data;if(d&&(t!=null&&t.contentWindow)&&(n==="requestingBrowserInfo"&&t.contentWindow.postMessage({fromPublisher:!0,source:r,message:"sendingBrowserInfo",browserInfo:yield T()},"*"),n==="setLocalStorageItem")){let a=JSON.parse(localStorage.getItem("erxes")||"{}");a[o]=s,localStorage.setItem("erxes",JSON.stringify(a))}}),u=document.createElement("meta");u.name="viewport";u.content="initial-scale=1, width=device-width";document.getElementsByTagName("head")[0].appendChild(u);var q=e=>{let t=e.form_id,n=`erxes-container-${t}`,d=`erxes-iframe-${t}`,r=document.getElementById(n);r||(r=document.createElement("div"),r.id=n);let o=document.getElementById(d);o||(o=document.createElement("iframe"),o.id=d,o.style.display="none",o.style.width="100%",o.style.margin="0 auto",o.style.height="100%",o.allowFullscreen=!0),o.src=P,r.appendChild(o);let s=document.querySelector(`[data-erxes-embed="${t}"]`);return console.log("embedContainer",s),s?s.appendChild(r):document.body.appendChild(r),o.onload=()=>{o.style.display="inherit";let a=`[data-erxes-modal="${e.form_id}"]`,i=o.contentWindow;if(!i)return;let m=f({},e);m.onAction&&delete m.onAction,i.postMessage({fromPublisher:!0,hasPopupHandlers:document.querySelectorAll(a).length>0,settings:m,storage:S("erxes")},"*")},{container:r,iframe:o}},w=(e,t)=>{let n=Object.keys(c).find(o=>{let s=JSON.parse(o);return e===s.form_id});if(!n)return;let{iframe:d}=c[n],r=d.contentWindow;r&&r.postMessage(f({fromPublisher:!0,formId:e},t),"*")};p("showPopup",e=>{w(e,{action:"showPopup"})});p("callFormSubmit",e=>{w(e,{action:"callSubmit"})});p("sendExtraFormContent",(e,t)=>{w(e,{action:"extraFormContent",html:t})});var h=window.erxesSettings.forms||[],c={},C=e=>JSON.stringify({form_id:e.form_id,channel_id:e.channel_id}),D=e=>h.find(t=>t.channel_id===e.channel_id&&t.form_id===e.form_id),L=e=>{let t=C(e);c[t]||(c[t]=q(e))},k=()=>{h.forEach(L)},v=()=>{new MutationObserver(()=>{h.forEach(t=>{document.querySelector(`[data-erxes-embed="${t.form_id}"]`)&&L(t)})}).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{k(),v()}):(k(),v());window.addEventListener("message",e=>l(void 0,null,function*(){let t=e.data||{},{fromErxes:n,source:d,message:r,settings:o}=t;if(!o||d!=="fromForms")return null;let{container:s,iframe:a}=c[C(o)]||{};F(e,a);let i=D(o);if(!i||!(n&&d==="fromForms"))return null;if(r==="submitResponse"&&i.onAction&&i.onAction(t),r==="connected"&&t.connectionInfo.widgetsLeadConnect.form.leadData.loadType==="popup"){let A=`[data-erxes-modal="${o.form_id}"]`,x=document.querySelectorAll(A);for(let g=0;g<x.length;g++)x[g].addEventListener("click",()=>{a==null||a.contentWindow.postMessage({fromPublisher:!0,action:"showPopup",formId:o.form_id},"*")})}if(r==="changeContainerClass"&&s&&(s.className=t.className),r==="changeContainerStyle"&&a){let m=t.style.match(/height:\s*([\d.]+px)/);m&&(a.style.height=m[1])}return null}));})();
