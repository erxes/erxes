"use strict";(()=>{var pe=Object.defineProperty,xe=Object.defineProperties;var fe=Object.getOwnPropertyDescriptors;var Y=Object.getOwnPropertySymbols;var we=Object.prototype.hasOwnProperty,Ae=Object.prototype.propertyIsEnumerable;var _=(o,n,r)=>n in o?pe(o,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):o[n]=r,y=(o,n)=>{for(var r in n||(n={}))we.call(n,r)&&_(o,r,n[r]);if(Y)for(var r of Y(n))Ae.call(n,r)&&_(o,r,n[r]);return o},W=(o,n)=>xe(o,fe(n));var E=(o,n,r)=>new Promise((f,w)=>{var m=c=>{try{d(r.next(c))}catch(A){w(A)}},p=c=>{try{d(r.throw(c))}catch(A){w(A)}},d=c=>c.done?f(c.value):Promise.resolve(c.value).then(m,p);d((r=r.apply(o,n)).next())});var $=`#erxes-messenger-container {
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
`;var ye=()=>({url:window.location.pathname,hostname:window.location.origin,language:navigator.language,userAgent:navigator.userAgent}),ee=(o,n)=>{let{message:r,fromErxes:f,source:w,key:m,value:p}=o.data||{};if(!(!f||!(n!=null&&n.contentWindow))&&(r==="requestingBrowserInfo"&&n.contentWindow.postMessage({fromPublisher:!0,source:w,message:"sendingBrowserInfo",browserInfo:ye()},"*"),r==="setLocalStorageItem")){let d=JSON.parse(localStorage.getItem("erxes")||"{}");d[m]=p,localStorage.setItem("erxes",JSON.stringify(d))}};var te="erxes-messenger-container",ne="erxes-messenger-iframe",re="erxes-messenger-launcher",Ee=24*60*60*1e3,ve=2e3,Le=()=>localStorage.getItem("erxes")||"{}",C=()=>{var o;return(o=window.erxesSettings)==null?void 0:o.messenger},H=()=>{var o;try{let n=JSON.parse(localStorage.getItem(re)||"");return(n==null?void 0:n.integrationId)===((o=C())==null?void 0:o.integrationId)?n:void 0}catch(n){return}},se=o=>{var n;try{localStorage.setItem(re,JSON.stringify(W(y(y({},H()),o),{integrationId:(n=C())==null?void 0:n.integrationId})))}catch(r){}},Ce=()=>{let o=C()||{},n=H();return!!(o.email||o.phone||o.code||o.data||o.companyData||!(n!=null&&n.savedAt)||n.engaged||Date.now()-n.savedAt>Ee)},oe=o=>{var m,p;let n=C(),r=localStorage.getItem("theme"),f=(p=(m=window.matchMedia)==null?void 0:m.call(window,"(prefers-color-scheme: dark)"))==null?void 0:p.matches,w=r==="dark"||!r&&f?"dark":"light";o.postMessage({fromPublisher:!0,settings:n,storage:Le(),theme:w},"*")};(function(){var Z,J;if(document.getElementById(te)){let e=document.getElementById(ne);e!=null&&e.contentWindow&&oe(e.contentWindow);return}let r=document.createElement("style");r.textContent=$,document.head.appendChild(r);let f=localStorage.getItem("theme"),w=(Z=window.matchMedia)==null?void 0:Z.call(window,"(prefers-color-scheme: dark)").matches;f==="dark"||!f&&w?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");let m=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),p="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",d=null,c=null,A=p,P="",S=!1,V=`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,I=document.createElement("div");I.id=te,m&&(document.documentElement.style.marginBottom="72px");let l=document.createElement("div");l.className="erxes-messenger-frame";let i=document.createElement("iframe");i.id=ne;let ae=(e=>{let t=document.currentScript||(()=>{let s=document.getElementsByTagName("script");return s[s.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("messengerBundle.js",""):""})("messenger");i.style.display="none",i.allow="camera *; microphone *; clipboard-read; clipboard-write";let a,R=0,M=!1,X=!1,O=!1,v=!1;function ie(){d&&document.getElementsByTagName("head")[0].removeChild(d),c=document.createElement("meta"),c.name="viewport",c.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(c)}function ce(){c&&document.getElementsByTagName("head")[0].removeChild(c),d&&document.getElementsByTagName("head")[0].appendChild(d)}let k=null,z=()=>{if(k)return k;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;k=new e}catch(e){}return k},de=()=>{let e=z();e&&e.resume().then(()=>{let t=e.createOscillator(),s=e.createGain();t.connect(s),s.connect(e.destination),t.type="sine",t.frequency.setValueAtTime(880,e.currentTime),t.frequency.setValueAtTime(660,e.currentTime+.1),s.gain.setValueAtTime(.3,e.currentTime),s.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}).catch(t=>{})},B=e=>{if(!a)return;let t=a.querySelector(".erxes-launcher");if(!t)return;let s=a.getElementById("erxes-unread-badge");e>0?(s||(s=a.createElement("span"),s.id="erxes-unread-badge",s.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",t.appendChild(s)),s.textContent=e>99?"99+":String(e)):s&&s.remove()},le=e=>{R=e,B(e)},F=e=>{var t;(e.type==="keyup"&&e.key==="Enter"||e.type==="click")&&((t=z())==null||t.resume(),U())},U=()=>{if(se({engaged:!0}),O){D();return}v=!v,L()},q=e=>{let t=a==null?void 0:a.querySelector(".erxes-launcher");t&&(A=e.backgroundImage,S=e.hasCustomLogo,t.style.cssText=`
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
    `,M&&(t.style.backgroundImage="none",t.innerHTML=V),u.style.opacity="1")},ge=()=>E(this,null,function*(){var e;if(a=u.contentDocument||((e=u==null?void 0:u.contentWindow)==null?void 0:e.document),a){a.documentElement.style.colorScheme="light",a.documentElement.style.background="transparent",a.body.style.background="transparent",a.body.style.margin="0";let t=a.createElement("div");t.setAttribute("role","button"),t.setAttribute("class","erxes-launcher"),t.setAttribute("tabindex","0"),a.body.appendChild(t),t.addEventListener("click",F),t.addEventListener("keyup",F),t.addEventListener("pointerenter",L);let s=H();s!=null&&s.savedAt&&q(s)}}),T=document.createElement("div");T.className="erxes-launcher-container";let u=document.createElement("iframe");u.id="erxes-launcher",u.className="erxes-launcher",u.src="about:blank",T.appendChild(u),u.addEventListener("load",ge),I.append(l,T),document.body.appendChild(I);function L(){X||(X=!0,i.src=ae,l.appendChild(i))}let me=()=>E(this,null,function*(){if(!i||!i.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=i.contentWindow;i.style.display="block",O=!0,oe(e),v&&(v=!1,D())});((e,t)=>{let s=window.Erxes||{};s[e]=t,window.Erxes=s})("showMessenger",()=>{!M&&!v&&U()}),i.addEventListener("load",me);let ue=()=>{let e=()=>setTimeout(()=>{"requestIdleCallback"in window?window.requestIdleCallback(L,{timeout:5e3}):L()},ve);document.readyState==="complete"?e():window.addEventListener("load",e,{once:!0})};(J=C())!=null&&J.eager?L():Ce()&&ue();let D=()=>{if(!i||!i.contentWindow)return;i.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger"},"*")},he=e=>E(this,null,function*(){let{data:t}=e;if(t.fromErxes&&t.message==="connected"&&t.apiUrl&&(P=t.apiUrl),t.fromErxes&&t.connectionInfo){let{connectionInfo:s}=t,{widgetsMessengerConnect:h}=s||{},{uiOptions:b}=h||{};if(!b)return console.error("Messenger: uiOptions is not defined");if(!(a!=null&&a.querySelector(".erxes-launcher")))return console.error("Messenger: launcher element is not defined");let{primary:x,launcherLogo:g}=b,K=(g==null?void 0:g.length)>0,Q={color:x==null?void 0:x.DEFAULT,foreground:x==null?void 0:x.foreground,hasCustomLogo:K,backgroundImage:K?`url(${P}/read-file?key=${encodeURIComponent(g)})`:p};q(Q),se(y(W(y({},Q),{savedAt:Date.now()}),h.customerId?{engaged:!0}:{}))}});window.addEventListener("message",he),window.addEventListener("message",e=>E(this,null,function*(){var x;let{data:t}=e,{isVisible:s,message:h,isSmallContainer:b}=t||{};if(ee(e,i),t.fromErxes&&t.source==="fromMessenger"){if(h==="playSound"){de();return}if(h==="unreadCount"){le((x=t.count)!=null?x:0);return}let g=a==null?void 0:a.querySelector(".erxes-launcher");if(!g)return console.error("Messenger: launcher element is not defined");m&&document.body.classList.toggle("widget-mobile",s),h==="expandMessenger"&&(l.classList.remove("erxes-messenger-shown"),l.classList.add("erxes-messenger-expand")),h==="collapseMessenger"&&(l.classList.remove("erxes-messenger-expand"),l.classList.add("erxes-messenger-shown")),h==="messenger"&&(m&&s?ie():ce(),s?(M=!0,l.classList.add("erxes-messenger-shown"),l.classList.remove("erxes-messenger-hidden"),g.style.backgroundImage="none",g.innerHTML=V,B(0)):(M=!1,l.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),l.classList.add("erxes-messenger-hidden"),g.style.backgroundImage=A,g.style.backgroundSize=S?"32px":"18px",g.innerHTML="",B(R))),"isSmallContainer"in(t||{})&&I.classList.toggle("small",b)}}));let j=window.location.pathname,N=()=>{let e=window.location.pathname;e!==j&&(j=e,i.contentWindow&&i.contentWindow.postMessage({fromPublisher:!0,action:"locationChange",url:e},"*"))},G=e=>{let t=history[e].bind(history);history[e]=(s,h,b)=>{t(s,h,b),N()}};G("pushState"),G("replaceState"),window.addEventListener("popstate",N),window.addEventListener("hashchange",N)})();})();
