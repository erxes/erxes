"use strict";(()=>{var ce=Object.defineProperty,de=Object.defineProperties;var le=Object.getOwnPropertyDescriptors;var z=Object.getOwnPropertySymbols;var me=Object.prototype.hasOwnProperty,ge=Object.prototype.propertyIsEnumerable;var O=(r,n,o)=>n in r?ce(r,n,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[n]=o,F=(r,n)=>{for(var o in n||(n={}))me.call(n,o)&&O(r,o,n[o]);if(z)for(var o of z(n))ge.call(n,o)&&O(r,o,n[o]);return r},U=(r,n)=>de(r,le(n));var A=(r,n,o)=>new Promise((p,x)=>{var g=d=>{try{c(o.next(d))}catch(w){x(w)}},f=d=>{try{c(o.throw(d))}catch(w){x(w)}},c=d=>d.done?p(d.value):Promise.resolve(d.value).then(g,f);c((o=o.apply(r,n)).next())});var D=`#erxes-messenger-container {
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
`;var M=null,he=()=>A(void 0,null,function*(){if(window.location.hostname==="localhost")return{url:window.location.pathname,hostname:window.location.href,language:navigator.language,userAgent:navigator.userAgent,countryCode:"MN"};if(!M)try{let n=yield(yield fetch("https://geo.erxes.io")).json();M={remoteAddress:n.network,region:n.region,countryCode:n.countryCode,city:n.city,country:n.countryName}}catch(r){M={city:"",remoteAddress:"",region:"",country:"",countryCode:""}}return U(F({},M),{url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent})}),q=(r,n)=>A(void 0,null,function*(){let{message:o,fromErxes:p,source:x,key:g,value:f}=r.data||{};if(!(!p||!(n!=null&&n.contentWindow))&&(o==="requestingBrowserInfo"&&n.contentWindow.postMessage({fromPublisher:!0,source:x,message:"sendingBrowserInfo",browserInfo:yield he()},"*"),o==="setLocalStorageItem")){let c=JSON.parse(localStorage.getItem("erxes")||"{}");c[g]=f,localStorage.setItem("erxes",JSON.stringify(c))}});var j="erxes-messenger-container",G="erxes-messenger-iframe",pe=()=>localStorage.getItem("erxes")||"{}",Z=r=>{var g,f,c;let n=(g=window.erxesSettings)==null?void 0:g.messenger,o=localStorage.getItem("theme"),p=(c=(f=window.matchMedia)==null?void 0:f.call(window,"(prefers-color-scheme: dark)"))==null?void 0:c.matches,x=o==="dark"||!o&&p?"dark":"light";r.postMessage({fromPublisher:!0,settings:n,storage:pe(),theme:x},"*")};(function(){var X;if(document.getElementById(j)){let e=document.getElementById(G);e!=null&&e.contentWindow&&Z(e.contentWindow);return}let o=document.createElement("style");o.textContent=D,document.head.appendChild(o);let p=localStorage.getItem("theme"),x=(X=window.matchMedia)==null?void 0:X.call(window,"(prefers-color-scheme: dark)").matches;p==="dark"||!p&&x?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");let g=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),f="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",c=null,d=null,w=f,B="",E=!1,T=`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,v=document.createElement("div");v.id=j,g&&(document.documentElement.style.marginBottom="72px");let m=document.createElement("div");m.className="erxes-messenger-frame";let a=document.createElement("iframe");a.id=G;let J=e=>{let t=document.currentScript||(()=>{let s=document.getElementsByTagName("script");return s[s.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("messengerBundle.js",""):""};a.src=J("messenger"),a.style.display="none",a.allow="camera *; microphone *; clipboard-read; clipboard-write";let i,N=0,I=!1;function K(){c&&document.getElementsByTagName("head")[0].removeChild(c),d=document.createElement("meta"),d.name="viewport",d.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(d)}function Q(){d&&document.getElementsByTagName("head")[0].removeChild(d),c&&document.getElementsByTagName("head")[0].appendChild(c)}let C=null,W=()=>{if(C)return C;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;C=new e}catch(e){}return C},Y=()=>{let e=W();e&&e.resume().then(()=>{let t=e.createOscillator(),s=e.createGain();t.connect(s),s.connect(e.destination),t.type="sine",t.frequency.setValueAtTime(880,e.currentTime),t.frequency.setValueAtTime(660,e.currentTime+.1),s.gain.setValueAtTime(.3,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}).catch(t=>{})},L=e=>{if(!i)return;let t=i.querySelector(".erxes-launcher");if(!t)return;let s=i.getElementById("erxes-unread-badge");e>0?(s||(s=i.createElement("span"),s.id="erxes-unread-badge",s.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",t.appendChild(s)),s.textContent=e>99?"99+":String(e)):s&&s.remove()},_=e=>{N=e,L(e)},P=e=>{var t;(e.type==="keyup"&&e.key==="Enter"||e.type==="click")&&((t=W())==null||t.resume(),se())},$=()=>A(this,null,function*(){var e;if(i=u.contentDocument||((e=u==null?void 0:u.contentWindow)==null?void 0:e.document),i){i.documentElement.style.colorScheme="light",i.documentElement.style.background="transparent",i.body.style.background="transparent",i.body.style.margin="0";let t=i.createElement("div");t.setAttribute("role","button"),t.setAttribute("class","erxes-launcher"),t.setAttribute("tabindex","0"),i.body.appendChild(t),t.addEventListener("click",P),t.addEventListener("keyup",P)}}),k=document.createElement("div");k.className="erxes-launcher-container";let u=document.createElement("iframe");u.id="erxes-launcher",u.className="erxes-launcher",u.src="about:blank",m.appendChild(a),k.appendChild(u),u.addEventListener("load",$),v.append(m,k),document.body.appendChild(v);let ee=()=>A(this,null,function*(){if(!a||!a.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=a.contentWindow;a.style.display="block",ne(e),Z(e),u.style.opacity="1"}),te=(e,t)=>{let s=window.Erxes||{};s[e]=t,window.Erxes=s},ne=e=>{te("showMessenger",()=>{e.postMessage({fromPublisher:!0,action:"showMessenger"},"*")})};a.addEventListener("load",ee);let se=()=>{if(!a||!a.contentWindow)return;a.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger"},"*")},oe=e=>A(this,null,function*(){let{data:t}=e;if(t.fromErxes&&t.message==="connected"&&t.apiUrl&&(B=t.apiUrl),t.fromErxes&&t.connectionInfo){let{connectionInfo:s}=t,{widgetsMessengerConnect:h}=s||{},{uiOptions:y}=h||{};if(!y)return console.error("Messenger: uiOptions is not defined");let b=i==null?void 0:i.querySelector(".erxes-launcher");if(!b)return console.error("Messenger: launcher element is not defined");let{primary:l,launcherLogo:re}=y,R=re,ie=l==null?void 0:l.DEFAULT,ae=l==null?void 0:l.foreground;E=!!R,w=E?`url(${B}/read-file?key=${encodeURIComponent(R)})`:w,b.style.cssText=`
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
      background-color: ${ie};
      color: ${ae||"#673fbd"};
      background-image: ${w};
      background-size: ${E?"32px":"18px"};
      background-position: center;
    `,I&&(b.style.backgroundImage="none",b.innerHTML=T)}});window.addEventListener("message",oe),window.addEventListener("message",e=>A(this,null,function*(){var b;let{data:t}=e,{isVisible:s,message:h,isSmallContainer:y}=t||{};if(yield q(e,a),t.fromErxes&&t.source==="fromMessenger"){if(h==="playSound"){Y();return}if(h==="unreadCount"){_((b=t.count)!=null?b:0);return}let l=i==null?void 0:i.querySelector(".erxes-launcher");if(!l)return console.error("Messenger: launcher element is not defined");g&&document.body.classList.toggle("widget-mobile",s),h==="expandMessenger"&&(m.classList.remove("erxes-messenger-shown"),m.classList.add("erxes-messenger-expand")),h==="collapseMessenger"&&(m.classList.remove("erxes-messenger-expand"),m.classList.add("erxes-messenger-shown")),h==="messenger"&&(g&&s?K():Q(),s?(I=!0,m.classList.add("erxes-messenger-shown"),m.classList.remove("erxes-messenger-hidden"),l.style.backgroundImage="none",l.innerHTML=T,L(0)):(I=!1,m.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),m.classList.add("erxes-messenger-hidden"),l.style.backgroundImage=w,l.style.backgroundSize=E?"32px":"18px",l.innerHTML="",L(N))),"isSmallContainer"in(t||{})&&v.classList.toggle("small",y)}}));let H=window.location.pathname,S=()=>{let e=window.location.pathname;e!==H&&(H=e,a.contentWindow&&a.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},V=e=>{let t=history[e].bind(history);history[e]=(s,h,y)=>{t(s,h,y),S()}};V("pushState"),V("replaceState"),window.addEventListener("popstate",S),window.addEventListener("hashchange",S)})();})();
