"use strict";(()=>{var xe=Object.defineProperty,fe=Object.defineProperties;var we=Object.getOwnPropertyDescriptors;var K=Object.getOwnPropertySymbols;var Ae=Object.prototype.hasOwnProperty,be=Object.prototype.propertyIsEnumerable;var _=(r,t,i)=>t in r?xe(r,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):r[t]=i,E=(r,t)=>{for(var i in t||(t={}))Ae.call(t,i)&&_(r,i,t[i]);if(K)for(var i of K(t))be.call(t,i)&&_(r,i,t[i]);return r},X=(r,t)=>fe(r,we(t));var v=(r,t,i)=>new Promise((f,w)=>{var u=d=>{try{g(i.next(d))}catch(A){w(A)}},h=d=>{try{g(i.throw(d))}catch(A){w(A)}},g=d=>d.done?f(d.value):Promise.resolve(d.value).then(u,h);g((i=i.apply(r,t)).next())});var $=`#erxes-messenger-container {
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
`;var Ee=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),ee=(r,t)=>{let{message:i,fromErxes:f,source:w,key:u,value:h}=r.data||{};if(!(!f||!(t!=null&&t.contentWindow))&&(i==="requestingBrowserInfo"&&t.contentWindow.postMessage({fromPublisher:!0,source:w,message:"sendingBrowserInfo",browserInfo:Ee()},"*"),i==="setLocalStorageItem")){let g=JSON.parse(localStorage.getItem("erxes")||"{}");g[u]=h,localStorage.setItem("erxes",JSON.stringify(g))}};var te="erxes-messenger-container",ne="erxes-messenger-iframe",re="erxes-messenger-launcher",ve=24*60*60*1e3,Ce=2e3,Le=()=>localStorage.getItem("erxes")||"{}",I=()=>{var r;return(r=window.erxesSettings)==null?void 0:r.messenger},T=()=>{var r;try{let t=JSON.parse(localStorage.getItem(re)||"");return(t==null?void 0:t.integrationId)===((r=I())==null?void 0:r.integrationId)?t:void 0}catch(t){return}},se=r=>{var t;try{localStorage.setItem(re,JSON.stringify(X(E(E({},T()),r),{integrationId:(t=I())==null?void 0:t.integrationId})))}catch(i){}},Me=()=>{let r=I()||{},t=T();return!!(r.email||r.phone||r.code||r.data||r.companyData||!(t!=null&&t.savedAt)||t.engaged||Date.now()-t.savedAt>ve)},O=r=>{var u,h;let t=I(),i=localStorage.getItem("theme"),f=(h=(u=window.matchMedia)==null?void 0:u.call(window,"(prefers-color-scheme: dark)"))==null?void 0:h.matches,w=i==="dark"||!i&&f?"dark":"light";r.postMessage({fromPublisher:!0,settings:t,storage:Le(),theme:w},"*")};(function(){var Q;let t=document.getElementById(te);if(t){if(t.refreshErxesMessenger){t.refreshErxesMessenger();return}let e=document.getElementById(ne);e!=null&&e.contentWindow&&O(e.contentWindow);return}let i=document.createElement("style");i.textContent=$,document.head.appendChild(i);let f=localStorage.getItem("theme"),w=(Q=window.matchMedia)==null?void 0:Q.call(window,"(prefers-color-scheme: dark)").matches;f==="dark"||!f&&w?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");let u=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),h="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",g=null,d=null,A=h,U="",S=!1,z=`
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,C=document.createElement("div");C.id=te,u&&(document.documentElement.style.marginBottom="72px");let m=document.createElement("div");m.className="erxes-messenger-frame";let a=document.createElement("iframe");a.id=ne,a.title="Messenger";let oe=(e=>{let n=document.currentScript||(()=>{let s=document.getElementsByTagName("script");return s[s.length-1]})();return n&&n instanceof HTMLScriptElement?n.src.replace("messengerBundle.js",""):""})("messenger");a.style.display="none",a.allow="camera *; microphone *; clipboard-read; clipboard-write";let o,k=0,b=!1,F=!1,N=!1,L=!1;function ie(){g&&document.getElementsByTagName("head")[0].removeChild(g),d=document.createElement("meta"),d.name="viewport",d.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(d)}function ae(){d&&document.getElementsByTagName("head")[0].removeChild(d),g&&document.getElementsByTagName("head")[0].appendChild(g)}let B=null,q=()=>{if(B)return B;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;B=new e}catch(e){}return B},le=()=>{let e=q();e&&e.resume().then(()=>{let n=e.createOscillator(),s=e.createGain();n.connect(s),s.connect(e.destination),n.type="sine",n.frequency.setValueAtTime(880,e.currentTime),n.frequency.setValueAtTime(660,e.currentTime+.1),s.gain.setValueAtTime(.3,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),n.start(e.currentTime),n.stop(e.currentTime+.3)}).catch(n=>{})},W=e=>{if(!o)return;let n=o.querySelector(".erxes-launcher");if(!n)return;let s=o.getElementById("erxes-unread-badge");e>0?(s||(s=o.createElement("span"),s.id="erxes-unread-badge",s.setAttribute("aria-hidden","true"),s.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",n.appendChild(s)),s.textContent=e>99?"99+":String(e)):s&&s.remove()},H=()=>{let e=o==null?void 0:o.querySelector(".erxes-launcher");e&&(e.setAttribute("aria-label",b?"Close messenger":k>0?`Open messenger, ${k} unread`:"Open messenger"),e.setAttribute("aria-expanded",String(b)))},ce=e=>{k=e,W(e),H()},de=()=>{var e;(e=q())==null||e.resume(),D(!L)},D=e=>{L=e,e&&se({engaged:!0}),N?G():e&&M()},V=e=>{let n=o==null?void 0:o.querySelector(".erxes-launcher");n&&(S=!!e.logoUrl,A=S?`url(${e.logoUrl})`:h,n.style.cssText=`
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
      background-image: ${A};
      background-size: ${S?"32px":"18px"};
      background-position: center;
    `,b&&(n.style.backgroundImage="none",n.innerHTML=z),l.style.visibility="visible",l.style.opacity="1")},ge=()=>{l.style.visibility="hidden",l.style.opacity="0"},me=()=>v(this,null,function*(){var e;if(o=l.contentDocument||((e=l==null?void 0:l.contentWindow)==null?void 0:e.document),o){o.documentElement.style.colorScheme="light",o.documentElement.style.background="transparent",o.body.style.background="transparent",o.body.style.margin="0";let n=o.createElement("style");n.textContent=".erxes-launcher{border:0;padding:0;margin:0;font:inherit;appearance:none}.erxes-launcher:focus{outline:none}.erxes-launcher:focus-visible{outline:2px solid #fff;outline-offset:-5px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.6)}",o.head.appendChild(n);let s=o.createElement("button");s.type="button",s.className="erxes-launcher",o.body.appendChild(s),H(),s.addEventListener("click",de),s.addEventListener("pointerenter",M);let c=T();c!=null&&c.savedAt&&V(c)}}),P=document.createElement("div");P.className="erxes-launcher-container";let l=document.createElement("iframe");l.id="erxes-launcher",l.className="erxes-launcher",l.src="about:blank",l.title="Messenger launcher",l.style.visibility="hidden",P.appendChild(l),l.addEventListener("load",me),C.append(m,P),document.body.appendChild(C);function M(){F||(F=!0,a.src=oe,m.appendChild(a))}let ue=()=>v(this,null,function*(){if(!a||!a.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=a.contentWindow;a.style.display="block",N=!0,O(e),L&&G()});((e,n)=>{let s=window.Erxes||{};s[e]=n,window.Erxes=s})("showMessenger",()=>D(!0)),a.addEventListener("load",ue);let he=()=>{let e=()=>setTimeout(()=>{"requestIdleCallback"in window?window.requestIdleCallback(M,{timeout:5e3}):M()},Ce);document.readyState==="complete"?e():window.addEventListener("load",e,{once:!0})},j=()=>{var e;(e=I())!=null&&e.eager?M():Me()&&he()};j(),C.refreshErxesMessenger=()=>{if(N&&a.contentWindow){O(a.contentWindow);return}let e=T();e!=null&&e.savedAt?V(e):ge(),j()};let G=()=>{!a||!a.contentWindow||a.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger",isVisible:L},"*")},pe=e=>v(this,null,function*(){let{data:n}=e;if(n.fromErxes&&n.message==="connected"&&n.apiUrl&&(U=n.apiUrl),n.fromErxes&&n.connectionInfo){let{connectionInfo:s}=n,{widgetsMessengerConnect:c}=s||{},{uiOptions:y}=c||{};if(!y)return console.error("Messenger: uiOptions is not defined");if(!(o!=null&&o.querySelector(".erxes-launcher")))return console.error("Messenger: launcher element is not defined");let{primary:p,launcherLogo:x}=y,Y={color:p==null?void 0:p.DEFAULT,foreground:p==null?void 0:p.foreground,logoUrl:x?`${U}/read-file?key=${encodeURIComponent(x)}`:""};V(Y),se(E(X(E({},Y),{savedAt:Date.now()}),c.customerId?{engaged:!0}:{}))}});window.addEventListener("message",pe),window.addEventListener("message",e=>v(this,null,function*(){var p;let{data:n}=e,{isVisible:s,message:c,isSmallContainer:y}=n||{};if(ee(e,a),n.fromErxes&&n.source==="fromMessenger"){if(c==="playSound"){le();return}if(c==="unreadCount"){ce((p=n.count)!=null?p:0);return}let x=o==null?void 0:o.querySelector(".erxes-launcher");if(!x)return console.error("Messenger: launcher element is not defined");u&&document.body.classList.toggle("widget-mobile",s),c==="expandMessenger"&&(m.classList.remove("erxes-messenger-shown"),m.classList.add("erxes-messenger-expand")),c==="collapseMessenger"&&(m.classList.remove("erxes-messenger-expand"),m.classList.add("erxes-messenger-shown")),c==="messenger"&&(u&&s?ie():ae(),s?(b=!0,m.classList.add("erxes-messenger-shown"),m.classList.remove("erxes-messenger-hidden"),x.style.backgroundImage="none",x.innerHTML=z,W(0)):(b=!1,m.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),m.classList.add("erxes-messenger-hidden"),x.style.backgroundImage=A,x.style.backgroundSize=S?"32px":"18px",x.innerHTML="",W(k)),L=b,H()),"isSmallContainer"in(n||{})&&C.classList.toggle("small",y)}}));let Z=window.location.pathname,R=()=>{let e=window.location.pathname;e!==Z&&(Z=e,a.contentWindow&&a.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},J=e=>{let n=history[e].bind(history);history[e]=(s,c,y)=>{n(s,c,y),R()}};J("pushState"),J("replaceState"),window.addEventListener("popstate",R),window.addEventListener("hashchange",R)})();})();
