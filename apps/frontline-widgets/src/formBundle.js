'use strict';
(() => {
  var C = Object.defineProperty;
  var y = Object.getOwnPropertySymbols;
  var A = Object.prototype.hasOwnProperty,
    _ = Object.prototype.propertyIsEnumerable;
  var b = (e, t, n) =>
      t in e
        ? C(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (e[t] = n),
    f = (e, t) => {
      for (var n in t || (t = {})) A.call(t, n) && b(e, n, t[n]);
      if (y) for (var n of y(t)) _.call(t, n) && b(e, n, t[n]);
      return e;
    };
  var c = (e, t, n) =>
    new Promise((s, r) => {
      var o = (i) => {
          try {
            a(n.next(i));
          } catch (m) {
            r(m);
          }
        },
        d = (i) => {
          try {
            a(n.throw(i));
          } catch (m) {
            r(m);
          }
        },
        a = (i) => (i.done ? s(i.value) : Promise.resolve(i.value).then(o, d));
      a((n = n.apply(e, t)).next());
    });
  var I = `[id^='erxes-container'] {
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
`;
  var S = (e) => localStorage.getItem(e);
  var E = document.createElement('style');
  E.textContent = I;
  document.head.appendChild(E);
  var B = () => {
      let e =
        document.currentScript ||
        (() => {
          let t = document.getElementsByTagName('script');
          return t[t.length - 1];
        })();
      return e && e instanceof HTMLScriptElement
        ? e.src.replace('/formBundle.js', '/form')
        : '';
    },
    u = (e, t) => {
      let n = window.Erxes || {};
      ((n[e] = t), (window.Erxes = n));
    },
    N = () =>
      c(void 0, null, function* () {
        if (window.location.hostname === 'localhost')
          return {
            url: window.location.pathname,
            hostname: window.location.href,
            language: navigator.language,
            userAgent: navigator.userAgent,
            countryCode: 'MN',
          };
        let e;
        try {
          e = yield (yield fetch('https://geo.erxes.io')).json();
        } catch (t) {
          e = {
            city: '',
            remoteAddress: '',
            region: '',
            country: '',
            countryCode: '',
          };
        }
        return {
          remoteAddress: e.network,
          region: e.region,
          countryCode: e.countryCode,
          city: e.city,
          country: e.countryName,
          url: window.location.pathname,
          hostname: window.location.origin,
          language: navigator.language,
          userAgent: navigator.userAgent,
        };
      }),
    R = (e, t) =>
      c(void 0, null, function* () {
        let { message: n, fromErxes: s, source: r, key: o, value: d } = e.data;
        if (
          s &&
          t != null &&
          t.contentWindow &&
          (n === 'requestingBrowserInfo' &&
            t.contentWindow.postMessage(
              {
                fromPublisher: !0,
                source: r,
                message: 'sendingBrowserInfo',
                browserInfo: yield N(),
              },
              '*',
            ),
          n === 'setLocalStorageItem')
        ) {
          let a = JSON.parse(localStorage.getItem('erxes') || '{}');
          ((a[o] = d), localStorage.setItem('erxes', JSON.stringify(a)));
        }
      }),
    w = document.createElement('meta');
  w.name = 'viewport';
  w.content = 'initial-scale=1, width=device-width';
  document.getElementsByTagName('head')[0].appendChild(w);
  var P = (e) => {
      let t = e.form_id,
        n = `erxes-container-${t}`,
        s = `erxes-iframe-${t}`,
        r = document.getElementById(n);
      r || ((r = document.createElement('div')), (r.id = n));
      let o = document.getElementById(s);
      o ||
        ((o = document.createElement('iframe')),
        (o.id = s),
        (o.style.display = 'none'),
        (o.style.width = '100%'),
        (o.style.margin = '0 auto'),
        (o.style.height = '100%'),
        (o.allowFullscreen = !0));
      let d = B();
      ((o.src = d), r.appendChild(o));
      let a = document.querySelector(`[data-erxes-embed="${t}"]`);
      return (
        a ? a.appendChild(r) : document.body.appendChild(r),
        (o.onload = () => {
          o.style.display = 'inherit';
          let i = `[data-erxes-modal="${e.form_id}"]`,
            m = o.contentWindow;
          if (!m) return;
          let l = f({}, e);
          (l.onAction && delete l.onAction,
            m.postMessage(
              {
                fromPublisher: !0,
                hasPopupHandlers: document.querySelectorAll(i).length > 0,
                settings: l,
                storage: S('erxes'),
              },
              '*',
            ));
        }),
        { container: r, iframe: o }
      );
    },
    h = (e, t) => {
      let n = Object.keys(g).find((o) => {
        let d = JSON.parse(o);
        return e === d.form_id;
      });
      if (!n) return;
      let { iframe: s } = g[n],
        r = s.contentWindow;
      r && r.postMessage(f({ fromPublisher: !0, formId: e }, t), '*');
    };
  u('showPopup', (e) => {
    h(e, { action: 'showPopup' });
  });
  u('callFormSubmit', (e) => {
    h(e, { action: 'callSubmit' });
  });
  u('sendExtraFormContent', (e, t) => {
    h(e, { action: 'extraFormContent', html: t });
  });
  var v = window.erxesSettings.forms || [],
    g = {},
    L = (e) => JSON.stringify({ form_id: e.form_id, channel_id: e.channel_id }),
    T = (e) =>
      v.find((t) => t.channel_id === e.channel_id && t.form_id === e.form_id),
    k = () => {
      v.forEach((e) => {
        g[L(e)] = P(e);
      });
    };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', k)
    : k();
  window.addEventListener('message', (e) =>
    c(void 0, null, function* () {
      let t = e.data || {},
        { fromErxes: n, source: s, message: r, settings: o } = t;
      if (!o || s !== 'fromForms') return null;
      let { container: d, iframe: a } = g[L(o)] || {};
      R(e, a);
      let i = T(o);
      if (!i || !(n && s === 'fromForms')) return null;
      if (
        (r === 'submitResponse' && i.onAction && i.onAction(t),
        r === 'connected' &&
          t.connectionInfo.widgetsLeadConnect.form.leadData.loadType ===
            'popup')
      ) {
        let l = `[data-erxes-modal="${o.form_id}"]`,
          x = document.querySelectorAll(l);
        for (let p = 0; p < x.length; p++)
          x[p].addEventListener('click', () => {
            a == null ||
              a.contentWindow.postMessage(
                { fromPublisher: !0, action: 'showPopup', formId: o.form_id },
                '*',
              );
          });
      }
      if (
        (r === 'changeContainerClass' && d && (d.className = t.className),
        r === 'changeContainerStyle' && a)
      ) {
        let m = t.style.match(/height:\s*([\d.]+px)/);
        m && (a.style.height = m[1]);
      }
      return null;
    }),
  );
})();
