"use strict";(()=>{var ue=Object.defineProperty,he=Object.defineProperties;var pe=Object.getOwnPropertyDescriptors;var J=Object.getOwnPropertySymbols;var xe=Object.prototype.hasOwnProperty,fe=Object.prototype.propertyIsEnumerable;var Q=(s,t,o)=>t in s?ue(s,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):s[t]=o,E=(s,t)=>{for(var o in t||(t={}))xe.call(t,o)&&Q(s,o,t[o]);if(J)for(var o of J(t))fe.call(t,o)&&Q(s,o,t[o]);return s},R=(s,t)=>he(s,pe(t));var v=(s,t,o)=>new Promise((g,m)=>{var w=p=>{try{h(o.next(p))}catch(A){m(A)}},u=p=>{try{h(o.throw(p))}catch(A){m(A)}},h=p=>p.done?g(p.value):Promise.resolve(p.value).then(w,u);h((o=o.apply(s,t)).next())});var Y=`#erxes-messenger-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 2147483647;
}

#erxes-messenger-iframe {
  position: absolute !important;
  border: none;
  z-index: 2147483647;
  height: 100%;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;
  /* Must match the embedded document's color scheme \u2014 a mismatch with a
     dark host page forces an opaque white canvas on the iframe */
  color-scheme: light;
  background: transparent;
}

/* Launcher iframe \u2014 extra space so the badge can overflow the button edge */
.erxes-launcher {
  position: absolute;
  right: 8px;
  bottom: 8px;
  border: none;
  z-index: 2147483649;
  overflow: visible;
  height: 72px;
  width: 72px;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: transparent;
  /* Must match the about:blank document's (light) scheme \u2014 a mismatch with a
     dark host page forces an opaque white canvas on the iframe */
  color-scheme: light;
}

.erxes-messenger-hidden {
  position: fixed;
  height: min(720px, 100% - 104px);
  min-height: 80px;
  width: 408px;
  max-height: 720px;
  border-radius: 1rem;
  right: 16px;
  bottom: 92px;
  transform-origin: right bottom;
  transition: width 200ms ease 0s, height 200ms ease 0s,
    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,
    opacity 83ms ease-out 0s;
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}
.erxes-messenger-expand {
  position: fixed;
  min-height: 80px;
  max-height: calc(100% - 104px);
  height: calc(100% - 104px);
  width: min(688px, max(0px, -20px + 100dvw));
  border-radius: 1rem;
  right: 16px;
  bottom: 92px;
  transform-origin: right bottom;
  transition: width 200ms ease 0s, height 200ms ease 0s,
    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,
    opacity 83ms ease-out 0s;
  opacity: 1;
  pointer-events: all;
  box-shadow: oklch(0.1621 0.017 256.72 / 90%) 0px 5px 40px 0px;
}

.erxes-messenger-shown {
  position: fixed;
  height: min(704px, 100% - 104px);
  min-height: 80px;
  width: min(400px, max(0px, -20px + 100dvw));
  max-height: 704px;
  border-radius: 1rem;
  right: 16px;
  bottom: 92px;
  transform-origin: right bottom;
  box-shadow: oklch(0.1621 0.017 256.72 / 90%) 0px 5px 40px 0px;
  opacity: 1;
  transition: width 200ms ease 0s, height 200ms ease 0s,
    max-height 200ms ease 0s, transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s,
    opacity 83ms ease-out 0s;
  pointer-events: all;
}

.erxes-messenger-shown:after {
  opacity: 0.9 !important;
  right: -20px !important;
  bottom: -20px !important;
}

.erxes-messenger-shown.small {
  max-height: 310px;
}

.erxes-messenger-shown > iframe,
.erxes-notifier-shown > iframe {
  height: 100% !important;
  max-width: none;
  bottom: 0;
}

.erxes-notifier-shown {
  width: 370px;
  height: 230px;
}

.erxes-notifier-shown.fullMessage {
  height: 550px;
  max-height: 100%;
}

@media only screen and (max-width: 420px) {
  #erxes-messenger-container {
    width: 100%;
    max-height: none;
  }

  .erxes-messenger-shown {
    height: calc(100% - 72px);
    width: 100%;
    max-height: none;
    display: block;
    right: 0;
    bottom: 72px;
  }

  #erxes-messenger-iframe {
    bottom: 0;
    right: 0;
  }

  body.messenger-widget-shown.widget-mobile {
    overflow: hidden;
    position: absolute;
    height: 100%;
  }
}
`;var Ae=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),K=(s,t)=>{let{message:o,fromErxes:g,source:m,key:w,value:u}=s.data||{};if(!(!g||!(t!=null&&t.contentWindow))&&(o==="requestingBrowserInfo"&&t.contentWindow.postMessage({fromPublisher:!0,source:m,message:"sendingBrowserInfo",browserInfo:Ae()},"*"),o==="setLocalStorageItem")){let h=JSON.parse(localStorage.getItem("erxes")||"{}");h[w]=u,localStorage.setItem("erxes",JSON.stringify(h))}};var _="erxes-messenger-container",$="erxes-messenger-iframe",te="erxes-messenger-launcher",be=24*60*60*1e3,ye=2e3,Ee=()=>localStorage.getItem("erxes")||"{}",I=()=>{var s;return(s=window.erxesSettings)==null?void 0:s.messenger},B=()=>{var s;try{let t=JSON.parse(localStorage.getItem(te)||"");return(t==null?void 0:t.integrationId)===((s=I())==null?void 0:s.integrationId)?t:void 0}catch(t){return}},ee=s=>{var t;try{localStorage.setItem(te,JSON.stringify(R(E(E({},B()),s),{integrationId:(t=I())==null?void 0:t.integrationId})))}catch(o){}},ve=()=>{let s=I()||{},t=B();return!!(s.email||s.phone||s.code||s.data||s.companyData||!(t!=null&&t.savedAt)||t.engaged||Date.now()-t.savedAt>be)},Ce=s=>{var g,m;if((s==null?void 0:s.theme)==="dark"||(s==null?void 0:s.theme)==="light")return s.theme;let t=localStorage.getItem("theme"),o=(m=(g=window.matchMedia)==null?void 0:g.call(window,"(prefers-color-scheme: dark)"))==null?void 0:m.matches;return t==="dark"||!t&&o?"dark":"light"},X=s=>{let t=I(),o=Ce(t);s.postMessage({fromPublisher:!0,settings:t,storage:Ee(),theme:o},"*")};(function(){let t=document.getElementById(_);if(t){if(t.refreshErxesMessenger){t.refreshErxesMessenger();return}let e=document.getElementById($);e!=null&&e.contentWindow&&X(e.contentWindow);return}let o=document.createElement("style");o.textContent=Y,document.head.appendChild(o);let g=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),m="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",w=null,u=null,h=m,p="",A=!1,O=`
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,C=document.createElement("div");C.id=_,g&&(document.documentElement.style.marginBottom="72px");let d=document.createElement("div");d.className="erxes-messenger-frame";let a=document.createElement("iframe");a.id=$,a.title="Messenger";let ne=(e=>{let n=document.currentScript||(()=>{let r=document.getElementsByTagName("script");return r[r.length-1]})();return n&&n instanceof HTMLScriptElement?n.src.replace("messengerBundle.js",""):""})("messenger");a.style.display="none",a.allow="camera *; microphone *; clipboard-read; clipboard-write";let i,S=0,b=!1,U=!1,T=!1,L=!1;function se(){w&&document.getElementsByTagName("head")[0].removeChild(w),u=document.createElement("meta"),u.name="viewport",u.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(u)}function re(){u&&document.getElementsByTagName("head")[0].removeChild(u),w&&document.getElementsByTagName("head")[0].appendChild(w)}let k=null,z=()=>{if(k)return k;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;k=new e}catch(e){}return k},oe=()=>{let e=z();e&&e.resume().then(()=>{let n=e.createOscillator(),r=e.createGain();n.connect(r),r.connect(e.destination),n.type="sine",n.frequency.setValueAtTime(880,e.currentTime),n.frequency.setValueAtTime(660,e.currentTime+.1),r.gain.setValueAtTime(.3,e.currentTime),r.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),n.start(e.currentTime),n.stop(e.currentTime+.3)}).catch(n=>{})},N=e=>{if(!i)return;let n=i.querySelector(".erxes-launcher");if(!n)return;let r=i.getElementById("erxes-unread-badge");e>0?(r||(r=i.createElement("span"),r.id="erxes-unread-badge",r.setAttribute("aria-hidden","true"),r.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",n.appendChild(r)),r.textContent=e>99?"99+":String(e)):r&&r.remove()},W=()=>{let e=i==null?void 0:i.querySelector(".erxes-launcher");e&&(e.setAttribute("aria-label",b?"Close messenger":S>0?`Open messenger, ${S} unread`:"Open messenger"),e.setAttribute("aria-expanded",String(b)))},ie=e=>{S=e,N(e),W()},ae=()=>{var e;(e=z())==null||e.resume(),F(!L)},F=e=>{L=e,e&&ee({engaged:!0}),T?D():e&&M()},H=e=>{let n=i==null?void 0:i.querySelector(".erxes-launcher");n&&(A=!!e.logoUrl,h=A?`url(${e.logoUrl})`:m,n.style.cssText=`
      width: 48px;
      height: 48px;
      font-smoothing: antialiased;
      animation: pop 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 20px;
      position: fixed;
      top: 0;
      left: 0;
      line-height: 48px;
      pointer-events: auto;
      text-align: center;
      transition: background-image 0.3s ease-in;
      z-index: 2147483646;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background-color: ${e.color};
      color: ${e.foreground||"#673fbd"};
      background-image: ${h};
      background-size: ${A?"32px":"18px"};
      background-position: center;
    `,b&&(n.style.backgroundImage="none",n.innerHTML=O),l.style.visibility="visible",l.style.opacity="1")},le=()=>{l.style.visibility="hidden",l.style.opacity="0"},ce=()=>v(this,null,function*(){var e;if(i=l.contentDocument||((e=l==null?void 0:l.contentWindow)==null?void 0:e.document),i){i.documentElement.style.colorScheme="light",i.documentElement.style.background="transparent",i.body.style.background="transparent",i.body.style.margin="0";let n=i.createElement("style");n.textContent=".erxes-launcher{border:0;padding:0;margin:0;font:inherit;appearance:none}.erxes-launcher:focus{outline:none}.erxes-launcher:focus-visible{outline:2px solid #fff;outline-offset:-5px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.6)}",i.head.appendChild(n);let r=i.createElement("button");r.type="button",r.className="erxes-launcher",i.body.appendChild(r),W(),r.addEventListener("click",ae),r.addEventListener("pointerenter",M);let c=B();c!=null&&c.savedAt&&H(c)}}),V=document.createElement("div");V.className="erxes-launcher-container";let l=document.createElement("iframe");l.id="erxes-launcher",l.className="erxes-launcher",l.src="about:blank",l.title="Messenger launcher",l.style.visibility="hidden",V.appendChild(l),l.addEventListener("load",ce),C.append(d,V),document.body.appendChild(C);function M(){U||(U=!0,a.src=ne,d.appendChild(a))}let de=()=>v(this,null,function*(){if(!a||!a.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=a.contentWindow;a.style.display="block",T=!0,X(e),L&&D()});((e,n)=>{let r=window.Erxes||{};r[e]=n,window.Erxes=r})("showMessenger",()=>F(!0)),a.addEventListener("load",de);let ge=()=>{let e=()=>setTimeout(()=>{"requestIdleCallback"in window?window.requestIdleCallback(M,{timeout:5e3}):M()},ye);document.readyState==="complete"?e():window.addEventListener("load",e,{once:!0})},q=()=>{var e;(e=I())!=null&&e.eager?M():ve()&&ge()};q(),C.refreshErxesMessenger=()=>{if(T&&a.contentWindow){X(a.contentWindow);return}let e=B();e!=null&&e.savedAt?H(e):le(),q()};let D=()=>{!a||!a.contentWindow||a.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger",isVisible:L},"*")},me=e=>v(this,null,function*(){let{data:n}=e;if(n.fromErxes&&n.message==="connected"&&n.apiUrl&&(p=n.apiUrl),n.fromErxes&&n.connectionInfo){let{connectionInfo:r}=n,{widgetsMessengerConnect:c}=r||{},{uiOptions:y}=c||{};if(!y)return console.error("Messenger: uiOptions is not defined");if(!(i!=null&&i.querySelector(".erxes-launcher")))return console.error("Messenger: launcher element is not defined");let{primary:x,launcherLogo:f}=y,Z={color:x==null?void 0:x.DEFAULT,foreground:x==null?void 0:x.foreground,logoUrl:f?`${p}/read-file?key=${encodeURIComponent(f)}`:""};H(Z),ee(E(R(E({},Z),{savedAt:Date.now()}),c.customerId?{engaged:!0}:{}))}});window.addEventListener("message",me),window.addEventListener("message",e=>v(this,null,function*(){var x;let{data:n}=e,{isVisible:r,message:c,isSmallContainer:y}=n||{};if(K(e,a),n.fromErxes&&n.source==="fromMessenger"){if(c==="playSound"){oe();return}if(c==="unreadCount"){ie((x=n.count)!=null?x:0);return}let f=i==null?void 0:i.querySelector(".erxes-launcher");if(!f)return console.error("Messenger: launcher element is not defined");g&&document.body.classList.toggle("widget-mobile",r),c==="expandMessenger"&&(d.classList.remove("erxes-messenger-shown"),d.classList.add("erxes-messenger-expand")),c==="collapseMessenger"&&(d.classList.remove("erxes-messenger-expand"),d.classList.add("erxes-messenger-shown")),c==="messenger"&&(g&&r?se():re(),r?(b=!0,d.classList.add("erxes-messenger-shown"),d.classList.remove("erxes-messenger-hidden"),f.style.backgroundImage="none",f.innerHTML=O,N(0)):(b=!1,d.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),d.classList.add("erxes-messenger-hidden"),f.style.backgroundImage=h,f.style.backgroundSize=A?"32px":"18px",f.innerHTML="",N(S)),L=b,W()),"isSmallContainer"in(n||{})&&C.classList.toggle("small",y)}}));let j=window.location.pathname,P=()=>{let e=window.location.pathname;e!==j&&(j=e,a.contentWindow&&a.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},G=e=>{let n=history[e].bind(history);history[e]=(r,c,y)=>{n(r,c,y),P()}};G("pushState"),G("replaceState"),window.addEventListener("popstate",P),window.addEventListener("hashchange",P)})();})();
