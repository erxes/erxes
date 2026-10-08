"use strict";(()=>{var he=Object.defineProperty,pe=Object.defineProperties;var xe=Object.getOwnPropertyDescriptors;var Q=Object.getOwnPropertySymbols;var fe=Object.prototype.hasOwnProperty,we=Object.prototype.propertyIsEnumerable;var Y=(o,n,r)=>n in o?he(o,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[n]=r,y=(o,n)=>{for(var r in n||(n={}))fe.call(n,r)&&Y(o,r,n[r]);if(Q)for(var r of Q(n))we.call(n,r)&&Y(o,r,n[r]);return o},W=(o,n)=>pe(o,xe(n));var E=(o,n,r)=>new Promise((f,w)=>{var g=c=>{try{d(r.next(c))}catch(A){w(A)}},h=c=>{try{d(r.throw(c))}catch(A){w(A)}},d=c=>c.done?f(c.value):Promise.resolve(c.value).then(g,h);d((r=r.apply(o,n)).next())});var _=`#erxes-messenger-container {
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
`;var be=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),$=(o,n)=>{let{message:r,fromErxes:f,source:w,key:g,value:h}=o.data||{};if(!(!f||!(n!=null&&n.contentWindow))&&(r==="requestingBrowserInfo"&&n.contentWindow.postMessage({fromPublisher:!0,source:w,message:"sendingBrowserInfo",browserInfo:be()},"*"),r==="setLocalStorageItem")){let d=JSON.parse(localStorage.getItem("erxes")||"{}");d[g]=h,localStorage.setItem("erxes",JSON.stringify(d))}};var ee="erxes-messenger-container",te="erxes-messenger-iframe",oe="erxes-messenger-launcher",ye=24*60*60*1e3,Ee=2e3,ve=()=>localStorage.getItem("erxes")||"{}",C=()=>{var o;return(o=window.erxesSettings)==null?void 0:o.messenger},H=()=>{var o;try{let n=JSON.parse(localStorage.getItem(oe)||"");return(n==null?void 0:n.integrationId)===((o=C())==null?void 0:o.integrationId)?n:void 0}catch(n){return}},ne=o=>{var n;try{localStorage.setItem(oe,JSON.stringify(W(y(y({},H()),o),{integrationId:(n=C())==null?void 0:n.integrationId})))}catch(r){}},Le=()=>{let o=C()||{},n=H();return!!(o.email||o.phone||o.code||o.data||o.companyData||!(n!=null&&n.savedAt)||n.engaged||Date.now()-n.savedAt>ye)},se=o=>{var g,h;let n=C(),r=localStorage.getItem("theme"),f=(h=(g=window.matchMedia)==null?void 0:g.call(window,"(prefers-color-scheme: dark)"))==null?void 0:h.matches,w=r==="dark"||!r&&f?"dark":"light";o.postMessage({fromPublisher:!0,settings:n,storage:ve(),theme:w},"*")};(function(){var Z,J;if(document.getElementById(ee)){let e=document.getElementById(te);e!=null&&e.contentWindow&&se(e.contentWindow);return}let r=document.createElement("style");r.textContent=_,document.head.appendChild(r);let f=localStorage.getItem("theme"),w=(Z=window.matchMedia)==null?void 0:Z.call(window,"(prefers-color-scheme: dark)").matches;f==="dark"||!f&&w?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");let g=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),h="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",d=null,c=null,A=h,P="",I=!1,V=`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,M=document.createElement("div");M.id=ee,g&&(document.documentElement.style.marginBottom="72px");let l=document.createElement("div");l.className="erxes-messenger-frame";let a=document.createElement("iframe");a.id=te;let re=(e=>{let t=document.currentScript||(()=>{let s=document.getElementsByTagName("script");return s[s.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("messengerBundle.js",""):""})("messenger");a.style.display="none",a.allow="camera *; microphone *; clipboard-read; clipboard-write";let i,R=0,k=!1,X=!1,O=!1,v=!1;function ie(){d&&document.getElementsByTagName("head")[0].removeChild(d),c=document.createElement("meta"),c.name="viewport",c.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(c)}function ae(){c&&document.getElementsByTagName("head")[0].removeChild(c),d&&document.getElementsByTagName("head")[0].appendChild(d)}let S=null,U=()=>{if(S)return S;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;S=new e}catch(e){}return S},ce=()=>{let e=U();e&&e.resume().then(()=>{let t=e.createOscillator(),s=e.createGain();t.connect(s),s.connect(e.destination),t.type="sine",t.frequency.setValueAtTime(880,e.currentTime),t.frequency.setValueAtTime(660,e.currentTime+.1),s.gain.setValueAtTime(.3,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}).catch(t=>{})},B=e=>{if(!i)return;let t=i.querySelector(".erxes-launcher");if(!t)return;let s=i.getElementById("erxes-unread-badge");e>0?(s||(s=i.createElement("span"),s.id="erxes-unread-badge",s.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",t.appendChild(s)),s.textContent=e>99?"99+":String(e)):s&&s.remove()},de=e=>{R=e,B(e)},z=e=>{var t;(e.type==="keyup"&&e.key==="Enter"||e.type==="click")&&((t=U())==null||t.resume(),F())},F=()=>{if(ne({engaged:!0}),O){D();return}v=!v,L()},q=e=>{let t=i==null?void 0:i.querySelector(".erxes-launcher");t&&(I=!!e.logoUrl,A=I?`url(${e.logoUrl})`:h,t.style.cssText=`
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
      background-size: ${I?"32px":"18px"};
      background-position: center;
    `,k&&(t.style.backgroundImage="none",t.innerHTML=V),m.style.opacity="1")},le=()=>E(this,null,function*(){var e;if(i=m.contentDocument||((e=m==null?void 0:m.contentWindow)==null?void 0:e.document),i){i.documentElement.style.colorScheme="light",i.documentElement.style.background="transparent",i.body.style.background="transparent",i.body.style.margin="0";let t=i.createElement("div");t.setAttribute("role","button"),t.setAttribute("class","erxes-launcher"),t.setAttribute("tabindex","0"),i.body.appendChild(t),t.addEventListener("click",z),t.addEventListener("keyup",z),t.addEventListener("pointerenter",L);let s=H();s!=null&&s.savedAt&&q(s)}}),T=document.createElement("div");T.className="erxes-launcher-container";let m=document.createElement("iframe");m.id="erxes-launcher",m.className="erxes-launcher",m.src="about:blank",T.appendChild(m),m.addEventListener("load",le),M.append(l,T),document.body.appendChild(M);function L(){X||(X=!0,a.src=re,l.appendChild(a))}let ge=()=>E(this,null,function*(){if(!a||!a.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=a.contentWindow;a.style.display="block",O=!0,se(e),v&&(v=!1,D())});((e,t)=>{let s=window.Erxes||{};s[e]=t,window.Erxes=s})("showMessenger",()=>{!k&&!v&&F()}),a.addEventListener("load",ge);let me=()=>{let e=()=>setTimeout(()=>{"requestIdleCallback"in window?window.requestIdleCallback(L,{timeout:5e3}):L()},Ee);document.readyState==="complete"?e():window.addEventListener("load",e,{once:!0})};(J=C())!=null&&J.eager?L():Le()&&me();let D=()=>{if(!a||!a.contentWindow)return;a.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger"},"*")},ue=e=>E(this,null,function*(){let{data:t}=e;if(t.fromErxes&&t.message==="connected"&&t.apiUrl&&(P=t.apiUrl),t.fromErxes&&t.connectionInfo){let{connectionInfo:s}=t,{widgetsMessengerConnect:u}=s||{},{uiOptions:b}=u||{};if(!b)return console.error("Messenger: uiOptions is not defined");if(!(i!=null&&i.querySelector(".erxes-launcher")))return console.error("Messenger: launcher element is not defined");let{primary:p,launcherLogo:x}=b,K={color:p==null?void 0:p.DEFAULT,foreground:p==null?void 0:p.foreground,logoUrl:x?`${P}/read-file?key=${encodeURIComponent(x)}`:""};q(K),ne(y(W(y({},K),{savedAt:Date.now()}),u.customerId?{engaged:!0}:{}))}});window.addEventListener("message",ue),window.addEventListener("message",e=>E(this,null,function*(){var p;let{data:t}=e,{isVisible:s,message:u,isSmallContainer:b}=t||{};if($(e,a),t.fromErxes&&t.source==="fromMessenger"){if(u==="playSound"){ce();return}if(u==="unreadCount"){de((p=t.count)!=null?p:0);return}let x=i==null?void 0:i.querySelector(".erxes-launcher");if(!x)return console.error("Messenger: launcher element is not defined");g&&document.body.classList.toggle("widget-mobile",s),u==="expandMessenger"&&(l.classList.remove("erxes-messenger-shown"),l.classList.add("erxes-messenger-expand")),u==="collapseMessenger"&&(l.classList.remove("erxes-messenger-expand"),l.classList.add("erxes-messenger-shown")),u==="messenger"&&(g&&s?ie():ae(),s?(k=!0,l.classList.add("erxes-messenger-shown"),l.classList.remove("erxes-messenger-hidden"),x.style.backgroundImage="none",x.innerHTML=V,B(0)):(k=!1,l.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),l.classList.add("erxes-messenger-hidden"),x.style.backgroundImage=A,x.style.backgroundSize=I?"32px":"18px",x.innerHTML="",B(R))),"isSmallContainer"in(t||{})&&M.classList.toggle("small",b)}}));let j=window.location.pathname,N=()=>{let e=window.location.pathname;e!==j&&(j=e,a.contentWindow&&a.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},G=e=>{let t=history[e].bind(history);history[e]=(s,u,b)=>{t(s,u,b),N()}};G("pushState"),G("replaceState"),window.addEventListener("popstate",N),window.addEventListener("hashchange",N)})();})();
