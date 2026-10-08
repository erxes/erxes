"use strict";(()=>{var d=`#erxes-kb-root {
  --erxes-kb-color: #4f33af;
  position: fixed;
  bottom: 16px;
  z-index: 2147483646;
}

#erxes-kb-root.erxes-kb-right {
  right: 16px;
}

#erxes-kb-root.erxes-kb-left {
  left: 16px;
}

.erxes-kb-launcher {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--erxes-kb-color);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 15, 30, 0.24);
  transition: transform 0.2s ease;
}

.erxes-kb-launcher:hover {
  transform: scale(1.05);
}

.erxes-kb-launcher:focus-visible {
  outline: 3px solid rgba(79, 51, 175, 0.4);
  outline-offset: 2px;
}

.erxes-kb-launcher svg {
  width: 26px;
  height: 26px;
}

.erxes-kb-icon-close,
.erxes-kb-open .erxes-kb-icon-open {
  display: none;
}

.erxes-kb-open .erxes-kb-icon-close {
  display: block;
}

.erxes-kb-panel {
  position: absolute;
  bottom: 72px;
  width: min(400px, calc(100vw - 32px));
  height: min(640px, calc(100vh - 104px));
  overflow: hidden;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 48px rgba(15, 15, 30, 0.28);
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.erxes-kb-right .erxes-kb-panel {
  right: 0;
  transform-origin: bottom right;
}

.erxes-kb-left .erxes-kb-panel {
  left: 0;
  transform-origin: bottom left;
}

.erxes-kb-open .erxes-kb-panel {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.erxes-kb-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  color-scheme: light;
}

[data-erxes-kbase] .erxes-kb-iframe {
  min-height: 560px;
  border-radius: 12px;
}

@media (max-width: 480px) {
  .erxes-kb-panel {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .erxes-kb-open .erxes-kb-launcher {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .erxes-kb-launcher,
  .erxes-kb-panel {
    transition: none;
  }
}
`;var b="/knowledgeBaseBundle.js",c="erxes-kb-root",p="erxes-kb-style",g='<svg class="erxes-kb-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"/><path d="M3 6v13"/><path d="M12 6v13"/><path d="M21 6v13"/></svg>',h='<svg class="erxes-kb-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>',w=()=>{var n;let t=document.currentScript;if(t instanceof HTMLScriptElement&&t.src)return t.src;let e=Array.from(document.getElementsByTagName("script")).find(o=>o.src.includes(b));return(n=e==null?void 0:e.src)!=null?n:""},u=w(),m=(t,e)=>`${u.split(b)[0]}/knowledgebase?topicId=${encodeURIComponent(t)}&mode=${e}`,f=t=>{let e=document.createElement("iframe");return e.src=t,e.title="Knowledge base",e.className="erxes-kb-iframe",e},y=(t,e)=>{if(t.source!==e.contentWindow)return null;let n=t.data;return n!=null&&n.fromErxesKnowledgeBase?n:null},E=(t,e)=>{t.querySelector(".erxes-kb-iframe")||t.appendChild(f(m(e,"inline")))},v=(t,e)=>{if(document.getElementById(c))return;let n=document.createElement("div");n.id=c,n.className=`erxes-kb-${e}`;let o=document.createElement("div");o.className="erxes-kb-panel";let i=f(m(t,"floating"));o.appendChild(i);let r=document.createElement("button");r.type="button",r.className="erxes-kb-launcher",r.setAttribute("aria-label","Help center"),r.setAttribute("aria-expanded","false"),r.innerHTML=g+h;let l=a=>{n.classList.toggle("erxes-kb-open",a),r.setAttribute("aria-expanded",String(a))};r.addEventListener("click",()=>l(!n.classList.contains("erxes-kb-open"))),window.addEventListener("message",a=>{let s=y(a,i);(s==null?void 0:s.type)==="close"&&(l(!1),r.focus()),(s==null?void 0:s.type)==="ready"&&s.color&&n.style.setProperty("--erxes-kb-color",s.color)}),n.appendChild(o),n.appendChild(r),document.body.appendChild(n)},x=()=>{let{erxesSettings:t}=window,e=t==null?void 0:t.knowledgeBase,n=(e==null?void 0:e.topicId)||(e==null?void 0:e.topic_id);if(!n||!u)return;if(!document.getElementById(p)){let i=document.createElement("style");i.id=p,i.textContent=d,document.head.appendChild(i)}let o=document.querySelector("[data-erxes-kbase]");if(o instanceof HTMLElement){E(o,n);return}v(n,t!=null&&t.messenger?"left":"right")};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x):x();})();
