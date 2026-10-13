// Scoped to the agent bot: every class carries the `aab-` prefix.
export const AI_AGENT_BOT_STYLES = `
@keyframes aab-hop { 0%,100% { transform: translateY(0) scale(1,1); } 15% { transform: scale(1.08,.92); } 40% { transform: translateY(-12px) scale(.95,1.06); } 62% { transform: scale(1.06,.94); } 75% { transform: scale(1,1); } }
@keyframes aab-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes aab-panic { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
@keyframes aab-breathe { 0%,100% { transform: scale(1,1); } 50% { transform: scale(1.02,.97); } }
@keyframes aab-nod { 0%,60%,100% { transform: rotate(0); } 70% { transform: rotate(5deg); } 85% { transform: rotate(0); } }
@keyframes aab-shake { 0%,55%,100% { transform: rotate(0); } 62% { transform: rotate(-7deg); } 70% { transform: rotate(7deg); } 78% { transform: rotate(-5deg); } 86% { transform: rotate(3deg); } }
@keyframes aab-wave { 0%,100% { transform: translate(-4px,2px) rotate(-10deg); } 50% { transform: translate(4px,-4px) rotate(10deg); } }
@keyframes aab-pump { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
@keyframes aab-shrug { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes aab-glance { 0%,40% { transform: translateX(0); } 50%,70% { transform: translateX(-3px); } 80%,90% { transform: translateX(3px); } 100% { transform: translateX(0); } }
@keyframes aab-blink { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
@keyframes aab-glow { 0%,100% { opacity: 1; } 50% { opacity: .6; } }
@keyframes aab-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes aab-signal { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
@keyframes aab-radiate { 0% { opacity: 0; transform: scale(.6); } 30% { opacity: 1; } 100% { opacity: 0; transform: scale(1.35); } }
@keyframes aab-scan { 0%,100% { transform: translateY(0); } 50% { transform: translateY(26px); } }
@keyframes aab-lens { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-2px,1px); } }
@keyframes aab-spin { to { transform: rotate(360deg); } }
@keyframes aab-pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
@keyframes aab-flicker { 0%,45%,55%,100% { opacity: 1; } 50% { opacity: .1; } 70% { opacity: .2; } }
@keyframes aab-flip { 0%,70%,100% { transform: scaleX(1); } 82% { transform: scaleX(-1); } }
@keyframes aab-float { 0% { opacity: 0; transform: translate(0,0); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(8px,-10px); } }
.aab-hand, .aab-eyes-offset, .aab-head { transition: transform .5s cubic-bezier(.3,1.5,.5,1); }
.aab-offset, .aab-lift, .aab-feet, .aab-book { transition: transform .55s cubic-bezier(.35,1.2,.5,1), opacity .3s; }
.aab-lift { transform-origin: 65px 120px; }
.aab-feet { transform-box: fill-box; transform-origin: center bottom; }
.aab-book { transform-box: fill-box; transform-origin: center; }
.aab-hand-fast { transition-duration: .18s; }
.aab-head, .aab-head-motion { transform-origin: 65px 82px; }
.aab-rig { transform-origin: 65px 120px; }
.aab-prop { transition: opacity .3s; }
.aab-missing :is(circle, rect, ellipse, line, path), circle.aab-missing {
  fill: none !important; stroke: #B4B2A9 !important; stroke-width: 1.5; stroke-dasharray: 4 3;
}
.aab-body-hop { animation: aab-hop 1.3s ease-in-out infinite; }
.aab-body-bounce { animation: aab-bounce 1.6s ease-in-out infinite; }
.aab-body-panic { animation: aab-panic .25s linear infinite; }
.aab-body-breathe { animation: aab-breathe 3s ease-in-out infinite; }
.aab-head-nod { animation: aab-nod 2.2s ease-in-out infinite; }
.aab-head-shake { animation: aab-shake 2.4s ease-in-out infinite; }
.aab-hand-wave { animation: aab-wave .7s ease-in-out infinite; }
.aab-hand-pump { animation: aab-pump 1.3s ease-in-out infinite; }
.aab-hand-shrug { animation: aab-shrug 1.6s ease-in-out infinite; }
.aab-glance { animation: aab-glance 4s ease-in-out infinite; }
.aab-blink { transform-box: fill-box; transform-origin: center; animation: aab-blink 3.5s infinite, aab-glow 3s ease-in-out infinite; }
.aab-glow { animation: aab-glow 3s ease-in-out infinite; }
.aab-pulse { animation: aab-pulse 1.2s ease-in-out infinite; }
.aab-signal { animation: aab-signal .5s steps(2) infinite; }
.aab-radiate { transform-origin: 65px 7px; animation: aab-radiate 1.5s ease-out infinite; }
.aab-scan { animation: aab-scan 1.8s ease-in-out infinite; }
.aab-scan-fast { animation-duration: .5s; }
.aab-lens { animation: aab-lens 2s ease-in-out infinite; }
.aab-spin { transform-box: fill-box; transform-origin: center; animation: aab-spin 3s linear infinite; }
.aab-spin-reverse { animation-direction: reverse; animation-duration: 2.2s; }
.aab-pop { transform-box: fill-box; transform-origin: center bottom; animation: aab-pop 1.3s ease-in-out infinite; }
.aab-flicker { animation: aab-flicker 1.1s steps(1) infinite; }
.aab-page-flip { transform-box: fill-box; transform-origin: left center; animation: aab-flip 2.8s ease-in-out infinite; }
.aab-float { animation: aab-float 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .aab-root * { animation: none !important; }
}
`;
