"use strict";(()=>{var y=(A,g,a)=>new Promise((h,p)=>{var l=i=>{try{r(a.next(i))}catch(f){p(f)}},x=i=>{try{r(a.throw(i))}catch(f){p(f)}},r=i=>i.done?h(i.value):Promise.resolve(i.value).then(l,x);r((a=a.apply(A,g)).next())});var R=`#erxes-messenger-container {
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
`;var oe=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),z=(A,g)=>{let{message:a,fromErxes:h,source:p,key:l,value:x}=A.data||{};if(!(!h||!(g!=null&&g.contentWindow))&&(a==="requestingBrowserInfo"&&g.contentWindow.postMessage({fromPublisher:!0,source:p,message:"sendingBrowserInfo",browserInfo:oe()},"*"),a==="setLocalStorageItem")){let r=JSON.parse(localStorage.getItem("erxes")||"{}");r[l]=x,localStorage.setItem("erxes",JSON.stringify(r))}};var O="erxes-messenger-container",F="erxes-messenger-iframe",re=()=>localStorage.getItem("erxes")||"{}",U=A=>{var l,x,r;let g=(l=window.erxesSettings)==null?void 0:l.messenger,a=localStorage.getItem("theme"),h=(r=(x=window.matchMedia)==null?void 0:x.call(window,"(prefers-color-scheme: dark)"))==null?void 0:r.matches,p=a==="dark"||!a&&h?"dark":"light";A.postMessage({fromPublisher:!0,settings:g,storage:re(),theme:p},"*")};(function(){var H;if(document.getElementById(O)){let e=document.getElementById(F);e!=null&&e.contentWindow&&U(e.contentWindow);return}let a=document.createElement("style");a.textContent=R,document.head.appendChild(a);let h=localStorage.getItem("theme"),p=(H=window.matchMedia)==null?void 0:H.call(window,"(prefers-color-scheme: dark)").matches;h==="dark"||!h&&p?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");let l=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),x="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",r=null,i=null,f=x,S="",E=!1,B=`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,v=document.createElement("div");v.id=O,l&&(document.documentElement.style.marginBottom="72px");let d=document.createElement("div");d.className="erxes-messenger-frame";let o=document.createElement("iframe");o.id=F;let D=e=>{let t=document.currentScript||(()=>{let n=document.getElementsByTagName("script");return n[n.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("messengerBundle.js",""):""};o.src=D("messenger"),o.style.display="none",o.allow="camera *; microphone *; clipboard-read; clipboard-write";let s,T=0,C=!1;function q(){r&&document.getElementsByTagName("head")[0].removeChild(r),i=document.createElement("meta"),i.name="viewport",i.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(i)}function j(){i&&document.getElementsByTagName("head")[0].removeChild(i),r&&document.getElementsByTagName("head")[0].appendChild(r)}let M=null,W=()=>{if(M)return M;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;M=new e}catch(e){}return M},G=()=>{let e=W();e&&e.resume().then(()=>{let t=e.createOscillator(),n=e.createGain();t.connect(n),n.connect(e.destination),t.type="sine",t.frequency.setValueAtTime(880,e.currentTime),t.frequency.setValueAtTime(660,e.currentTime+.1),n.gain.setValueAtTime(.3,e.currentTime),n.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}).catch(t=>{})},L=e=>{if(!s)return;let t=s.querySelector(".erxes-launcher");if(!t)return;let n=s.getElementById("erxes-unread-badge");e>0?(n||(n=s.createElement("span"),n.id="erxes-unread-badge",n.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",t.appendChild(n)),n.textContent=e>99?"99+":String(e)):n&&n.remove()},Z=e=>{T=e,L(e)},N=e=>{var t;(e.type==="keyup"&&e.key==="Enter"||e.type==="click")&&((t=W())==null||t.resume(),_())},J=()=>y(this,null,function*(){var e;if(s=m.contentDocument||((e=m==null?void 0:m.contentWindow)==null?void 0:e.document),s){s.documentElement.style.colorScheme="light",s.documentElement.style.background="transparent",s.body.style.background="transparent",s.body.style.margin="0";let t=s.createElement("div");t.setAttribute("role","button"),t.setAttribute("class","erxes-launcher"),t.setAttribute("tabindex","0"),s.body.appendChild(t),t.addEventListener("click",N),t.addEventListener("keyup",N)}}),I=document.createElement("div");I.className="erxes-launcher-container";let m=document.createElement("iframe");m.id="erxes-launcher",m.className="erxes-launcher",m.src="about:blank",d.appendChild(o),I.appendChild(m),m.addEventListener("load",J),v.append(d,I),document.body.appendChild(v);let K=()=>y(this,null,function*(){if(!o||!o.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=o.contentWindow;o.style.display="block",Y(e),U(e),m.style.opacity="1"}),Q=(e,t)=>{let n=window.Erxes||{};n[e]=t,window.Erxes=n},Y=e=>{Q("showMessenger",()=>{e.postMessage({fromPublisher:!0,action:"showMessenger"},"*")})};o.addEventListener("load",K);let _=()=>{if(!o||!o.contentWindow)return;o.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger"},"*")},$=e=>y(this,null,function*(){let{data:t}=e;if(t.fromErxes&&t.message==="connected"&&t.apiUrl&&(S=t.apiUrl),t.fromErxes&&t.connectionInfo){let{connectionInfo:n}=t,{widgetsMessengerConnect:u}=n||{},{uiOptions:b}=u||{};if(!b)return console.error("Messenger: uiOptions is not defined");let w=s==null?void 0:s.querySelector(".erxes-launcher");if(!w)return console.error("Messenger: launcher element is not defined");let{primary:c,launcherLogo:ee}=b,X=ee,te=c==null?void 0:c.DEFAULT,ne=c==null?void 0:c.foreground;E=X.length>0,f=E?`url(${S}/read-file?key=${encodeURIComponent(X)})`:f,w.style.cssText=`
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
      background-color: ${te};
      color: ${ne||"#673fbd"};
      background-image: ${f};
      background-size: ${E?"32px":"18px"};
      background-position: center;
    `,C&&(w.style.backgroundImage="none",w.innerHTML=B)}});window.addEventListener("message",$),window.addEventListener("message",e=>y(this,null,function*(){var w;let{data:t}=e,{isVisible:n,message:u,isSmallContainer:b}=t||{};if(z(e,o),t.fromErxes&&t.source==="fromMessenger"){if(u==="playSound"){G();return}if(u==="unreadCount"){Z((w=t.count)!=null?w:0);return}let c=s==null?void 0:s.querySelector(".erxes-launcher");if(!c)return console.error("Messenger: launcher element is not defined");l&&document.body.classList.toggle("widget-mobile",n),u==="expandMessenger"&&(d.classList.remove("erxes-messenger-shown"),d.classList.add("erxes-messenger-expand")),u==="collapseMessenger"&&(d.classList.remove("erxes-messenger-expand"),d.classList.add("erxes-messenger-shown")),u==="messenger"&&(l&&n?q():j(),n?(C=!0,d.classList.add("erxes-messenger-shown"),d.classList.remove("erxes-messenger-hidden"),c.style.backgroundImage="none",c.innerHTML=B,L(0)):(C=!1,d.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),d.classList.add("erxes-messenger-hidden"),c.style.backgroundImage=f,c.style.backgroundSize=E?"32px":"18px",c.innerHTML="",L(T))),"isSmallContainer"in(t||{})&&v.classList.toggle("small",b)}}));let P=window.location.pathname,k=()=>{let e=window.location.pathname;e!==P&&(P=e,o.contentWindow&&o.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},V=e=>{let t=history[e].bind(history);history[e]=(n,u,b)=>{t(n,u,b),k()}};V("pushState"),V("replaceState"),window.addEventListener("popstate",k),window.addEventListener("hashchange",k)})();})();
