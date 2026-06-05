"use strict";(()=>{var p=(e,t,n)=>new Promise((i,l)=>{var d=c=>{try{g(n.next(c))}catch(u){l(u)}},s=c=>{try{g(n.throw(c))}catch(u){l(u)}},g=c=>c.done?i(c.value):Promise.resolve(c.value).then(d,s);g((n=n.apply(e,t)).next())});var C=`#erxes-messenger-container {
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
`;var B=document.createElement("style");B.textContent=C;document.head.appendChild(B);var k=localStorage.getItem("theme"),T,P=(T=window.matchMedia)==null?void 0:T.call(window,"(prefers-color-scheme: dark)").matches;k==="dark"||!k&&P?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");var y=navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Android/i),z="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)",w=null,h=null,f=z,M="",A=!1,I="erxes-messenger-container",V="erxes-messenger-iframe",H=`
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,b=document.createElement("div");b.id=I;y&&(document.documentElement.style.marginBottom="72px");var a=document.createElement("div");a.className="erxes-messenger-frame";var r=document.createElement("iframe");r.id=V;var F=e=>{let t=document.currentScript||(()=>{let n=document.getElementsByTagName("script");return n[n.length-1]})();return t&&t instanceof HTMLScriptElement?t.src.replace("messengerBundle.js",""):""};r.src=F("messenger");r.style.display="none";r.allow="camera *; microphone *; clipboard-read; clipboard-write";var o,S=0;function R(){w&&document.getElementsByTagName("head")[0].removeChild(w),h=document.createElement("meta"),h.name="viewport",h.content="initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width",document.getElementsByTagName("head")[0].appendChild(h)}function O(){h&&document.getElementsByTagName("head")[0].removeChild(h),w&&document.getElementsByTagName("head")[0].appendChild(w)}var x=null,W=()=>{if(x)return x;try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;x=new e}catch(e){}return x},U=()=>{let e=W();e&&e.resume().then(()=>{let t=e.createOscillator(),n=e.createGain();t.connect(n),n.connect(e.destination),t.type="sine",t.frequency.setValueAtTime(880,e.currentTime),t.frequency.setValueAtTime(660,e.currentTime+.1),n.gain.setValueAtTime(.3,e.currentTime),n.gain.exponentialRampToValueAtTime(.001,e.currentTime+.3),t.start(e.currentTime),t.stop(e.currentTime+.3)}).catch(t=>{})},E=e=>{if(!o)return;let t=o.querySelector(".erxes-launcher");if(!t)return;let n=o.getElementById("erxes-unread-badge");e>0?(n||(n=o.createElement("span"),n.id="erxes-unread-badge",n.style.cssText="position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;box-sizing:border-box;pointer-events:none;line-height:1;font-family:sans-serif;z-index:1;",t.appendChild(n)),n.textContent=e>99?"99+":String(e)):n&&n.remove()},j=e=>{S=e,E(e)},L=e=>{var t;(e.type==="keyup"&&e.key==="Enter"||e.type==="click")&&((t=W())==null||t.resume(),Y())},D=()=>p(void 0,null,function*(){var e;if(o=m.contentDocument||((e=m==null?void 0:m.contentWindow)==null?void 0:e.document),o){let t=o.createElement("div");t.setAttribute("role","button"),t.setAttribute("class","erxes-launcher"),t.setAttribute("tabindex","0"),o.body.appendChild(t),t.addEventListener("click",L),t.addEventListener("keyup",L)}}),v=document.createElement("div");v.className="erxes-launcher-container";var m=document.createElement("iframe");m.id="erxes-launcher";m.className="erxes-launcher";m.src="about:blank";a.appendChild(r);v.appendChild(m);m.addEventListener("load",D);b.append(a,v);document.body.appendChild(b);var G=()=>p(void 0,null,function*(){if(!r||!r.contentWindow){console.error("Messenger: Iframe or content window is not available");return}let e=r.contentWindow;r.style.display="block",Q(e),q(e),m.style.opacity="1"}),Z=()=>localStorage.getItem("erxes")||"{}",K=(e,t)=>{let n=window.Erxes||{};n[e]=t,window.Erxes=n},Q=e=>{K("showMessenger",()=>{e.postMessage({fromPublisher:!0,action:"showMessenger"},"*")})},q=e=>{var d,s,g;let t=(d=window.erxesSettings)==null?void 0:d.messenger,n=localStorage.getItem("theme"),i=(g=(s=window.matchMedia)==null?void 0:s.call(window,"(prefers-color-scheme: dark)"))==null?void 0:g.matches,l=n==="dark"||!n&&i?"dark":"light";e.postMessage({fromPublisher:!0,settings:t,storage:Z(),theme:l},"*")};r.addEventListener("load",G);var Y=()=>{if(!r||!r.contentWindow)return;r.contentWindow.postMessage({fromPublisher:!0,action:"toggleMessenger"},"*")},J=e=>p(void 0,null,function*(){let{data:t}=e;if(t.fromErxes&&t.message==="connected"&&t.apiUrl&&(M=t.apiUrl),t.fromErxes&&t.connectionInfo){let{connectionInfo:n}=t,{widgetsMessengerConnect:i}=n||{},{uiOptions:l}=i||{};if(!l)return console.error("Messenger: uiOptions is not defined");let d=o==null?void 0:o.querySelector(".erxes-launcher");if(!d)return console.error("Messenger: launcher element is not defined");let{primary:s,logo:g}=l,c=g,u=s==null?void 0:s.DEFAULT,X=s==null?void 0:s.foreground;A=!!c,f=A?`url(${M}/read-file?key=${encodeURIComponent(c)})`:f,d.style.cssText=`
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
      background-color: ${u};
      color: ${X||"#673fbd"};
      background-image: ${f};
      background-size: ${A?"32px":"18px"};
      background-position: center;
    `}});window.addEventListener("message",J);window.addEventListener("message",e=>p(void 0,null,function*(){var d;let{data:t}=e,{isVisible:n,message:i,isSmallContainer:l}=t||{};if(t.fromErxes&&t.source==="fromMessenger"){if(i==="playSound"){U();return}if(i==="unreadCount"){j((d=t.count)!=null?d:0);return}let s=o==null?void 0:o.querySelector(".erxes-launcher");if(!s)return console.error("Messenger: launcher element is not defined");y&&document.body.classList.toggle("widget-mobile",n),i==="expandMessenger"&&(a.classList.remove("erxes-messenger-shown"),a.classList.add("erxes-messenger-expand")),i==="collapseMessenger"&&(a.classList.remove("erxes-messenger-expand"),a.classList.add("erxes-messenger-shown")),i==="messenger"&&(y&&n?R():O(),n?(a.classList.add("erxes-messenger-shown"),a.classList.remove("erxes-messenger-hidden"),s.style.backgroundImage="none",s.innerHTML=H,E(0)):(a.classList.remove("erxes-messenger-shown","erxes-messenger-expand"),a.classList.add("erxes-messenger-hidden"),s.style.backgroundImage=f,s.style.backgroundSize=A?"32px":"18px",s.innerHTML="",E(S))),"isSmallContainer"in(t||{})&&b.classList.toggle("small",l)}}));})();
