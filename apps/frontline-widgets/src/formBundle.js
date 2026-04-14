'use strict';
(() => {
  var C = Object.defineProperty;
  var x = Object.getOwnPropertySymbols;
  var A = Object.prototype.hasOwnProperty,
    _ = Object.prototype.propertyIsEnumerable;
  var y = (e, t, n) =>
      t in e
        ? C(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (e[t] = n),
    c = (e, t) => {
      for (var n in t || (t = {})) A.call(t, n) && y(e, n, t[n]);
      if (x) for (var n of x(t)) _.call(t, n) && y(e, n, t[n]);
      return e;
    };
  var l = (e, t, n) =>
    new Promise((d, a) => {
      var o = (r) => {
          try {
            s(n.next(r));
          } catch (m) {
            a(m);
          }
        },
        i = (r) => {
          try {
            s(n.throw(r));
          } catch (m) {
            a(m);
          }
        },
        s = (r) => (r.done ? d(r.value) : Promise.resolve(r.value).then(o, i));
      s((n = n.apply(e, t)).next());
    });
  var b = `[id^='erxes-container'] {
  z-index: 1000000000;
  border: none;
}

[id^='erxes-container'] > iframe {
  border: none;
  height: 100% !important;
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
  var I = (e) => localStorage.getItem(e);
  var k = document.createElement('style');
  k.textContent = b;
  document.head.appendChild(k);
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
    p = (e, t) => {
      let n = window.Erxes || {};
      ((n[e] = t), (window.Erxes = n));
    },
    P = () =>
      l(void 0, null, function* () {
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
    N = (e, t) =>
      l(void 0, null, function* () {
        let { message: n, fromErxes: d, source: a, key: o, value: i } = e.data;
        if (
          d &&
          t != null &&
          t.contentWindow &&
          (n === 'requestingBrowserInfo' &&
            t.contentWindow.postMessage(
              {
                fromPublisher: !0,
                source: a,
                message: 'sendingBrowserInfo',
                browserInfo: yield P(),
              },
              '*',
            ),
          n === 'setLocalStorageItem')
        ) {
          let s = JSON.parse(localStorage.getItem('erxes') || '{}');
          ((s[o] = i), localStorage.setItem('erxes', JSON.stringify(s)));
        }
      }),
    u = document.createElement('meta');
  u.name = 'viewport';
  u.content = 'initial-scale=1, width=device-width';
  document.getElementsByTagName('head')[0].appendChild(u);
  var R = (e) => {
      let t = e.form_id,
        n = `erxes-container-${t}`,
        d = `erxes-iframe-${t}`,
        a = document.getElementById(n);
      a || ((a = document.createElement('div')), (a.id = n));
      let o = document.getElementById(d);
      (o ||
        ((o = document.createElement('iframe')),
        (o.id = d),
        (o.style.display = 'none'),
        (o.style.width = '100%'),
        (o.style.margin = '0 auto'),
        (o.style.height = 'auto'),
        (o.allowFullscreen = !0)),
        (o.src = B()),
        a.appendChild(o));
      let i = document.querySelector(`[data-erxes-embed="${t}"]`);
      return (
        i ? i.appendChild(a) : document.body.appendChild(a),
        (o.onload = () => {
          o.style.display = 'inherit';
          let s = `[data-erxes-modal="${e.form_id}"]`,
            r = o.contentWindow;
          if (!r) return;
          let m = c({}, e);
          (m.onAction && delete m.onAction,
            r.postMessage(
              {
                fromPublisher: !0,
                hasPopupHandlers: document.querySelectorAll(s).length > 0,
                settings: m,
                storage: I('erxes'),
              },
              '*',
            ));
        }),
        { container: a, iframe: o }
      );
    },
    w = (e, t) => {
      let n = Object.keys(f).find((o) => {
        let i = JSON.parse(o);
        return e === i.form_id;
      });
      if (!n) return;
      let { iframe: d } = f[n],
        a = d.contentWindow;
      a && a.postMessage(c({ fromPublisher: !0, formId: e }, t), '*');
    };
  p('showPopup', (e) => {
    w(e, { action: 'showPopup' });
  });
  p('callFormSubmit', (e) => {
    w(e, { action: 'callSubmit' });
  });
  p('sendExtraFormContent', (e, t) => {
    w(e, { action: 'extraFormContent', html: t });
  });
  var v = window.erxesSettings.forms || [],
    f = {},
    E = (e) => JSON.stringify({ form_id: e.form_id, channel_id: e.channel_id }),
    F = (e) =>
      v.find((t) => t.channel_id === e.channel_id && t.form_id === e.form_id),
    S = () => {
      v.forEach((e) => {
        f[E(e)] = R(e);
      });
    };
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', S)
    : S();
  window.addEventListener('message', (e) =>
    l(void 0, null, function* () {
      let t = e.data || {},
        { fromErxes: n, source: d, message: a, settings: o } = t;
      if (!o || d !== 'fromForms') return null;
      let { container: i, iframe: s } = f[E(o)] || {};
      N(e, s);
      let r = F(o);
      if (!r || !(n && d === 'fromForms')) return null;
      if (
        (a === 'submitResponse' && r.onAction && r.onAction(t),
        a === 'connected' &&
          t.connectionInfo.widgetsLeadConnect.form.leadData.loadType ===
            'popup')
      ) {
        let L = `[data-erxes-modal="${o.form_id}"]`,
          h = document.querySelectorAll(L);
        for (let g = 0; g < h.length; g++)
          h[g].addEventListener('click', () => {
            s == null ||
              s.contentWindow.postMessage(
                { fromPublisher: !0, action: 'showPopup', formId: o.form_id },
                '*',
              );
          });
      }
      return (
        a === 'changeContainerClass' && i && (i.className = t.className),
        a === 'changeContainerStyle' && i && (i.style = t.style),
        null
      );
    }),
  );
})();
