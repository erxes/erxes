'use strict';
(() => {
  var h = (t, e, n) =>
    new Promise((m, d) => {
      var o = (r) => {
          try {
            g(n.next(r));
          } catch (f) {
            d(f);
          }
        },
        p = (r) => {
          try {
            g(n.throw(r));
          } catch (f) {
            d(f);
          }
        },
        g = (r) => (r.done ? m(r.value) : Promise.resolve(r.value).then(o, p));
      g((n = n.apply(t, e)).next());
    });
  var E = `#erxes-messenger-container {
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

.erxes-launcher {
  position: absolute;
  right: 12px;
  bottom: 12px;
  border: none;
  z-index: 2147483649;
  overflow: hidden;
  height: 48px;
  width: 48px;
  opacity: 0;
  transition: box-shadow 0.3s ease-in-out, opacity 0.3s;
  border-radius: 50%;
  filter: drop-shadow(rgba(9, 14, 21, 0.54) 0px 1px 6px)
    drop-shadow(rgba(9, 14, 21, 0.9) 0px 2px 32px);
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

.erxes-messenger-shown {
  position: fixed;
  height: 100%;
  min-height: 378px;
  width: 408px;
  max-height: 600px;
  border-radius: 1rem;
  right: 16px;
  bottom: 92px;
  transform-origin: right bottom;
  box-shadow: 0 2px 8px 1px rgba(0, 0, 0, 0.2);
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
    height: 100%;
    width: 100%;
    max-height: none;
    display: block;
    right: 0;
    bottom: 0;
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
`;
  var M = document.createElement('style');
  M.textContent = E;
  document.head.appendChild(M);
  var y =
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i),
    k =
      'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)',
    A = null,
    l = null,
    u = k,
    v = '',
    x = !1,
    B = 'erxes-messenger-container',
    W = 'erxes-messenger-iframe',
    X = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,
    w = document.createElement('div');
  w.id = B;
  var c = document.createElement('div');
  c.className = 'erxes-messenger-frame';
  var s = document.createElement('iframe');
  s.id = W;
  var N = (t) => {
    let e =
      document.currentScript ||
      (() => {
        let n = document.getElementsByTagName('script');
        return n[n.length - 1];
      })();
    return e && e instanceof HTMLScriptElement
      ? e.src.replace('index.js', '')
      : '';
  };
  s.src = N('messenger');
  s.style.display = 'none';
  s.allow = 'camera *; microphone *; clipboard-read; clipboard-write';
  var i;
  function P() {
    (A && document.getElementsByTagName('head')[0].removeChild(A),
      (l = document.createElement('meta')),
      (l.name = 'viewport'),
      (l.content =
        'initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width'),
      document.getElementsByTagName('head')[0].appendChild(l));
  }
  function T() {
    (l && document.getElementsByTagName('head')[0].removeChild(l),
      A && document.getElementsByTagName('head')[0].appendChild(A));
  }
  var C = (t) => {
      ((t.type === 'keyup' && t.key === 'Enter') || t.type === 'click') && R();
    },
    z = () =>
      h(void 0, null, function* () {
        var t;
        if (
          ((i =
            a.contentDocument ||
            ((t = a == null ? void 0 : a.contentWindow) == null
              ? void 0
              : t.document)),
          i)
        ) {
          let e = i.createElement('div');
          (e.setAttribute('role', 'button'),
            e.setAttribute('class', 'erxes-launcher'),
            e.setAttribute('tabindex', '0'),
            i.body.appendChild(e),
            e.addEventListener('click', C),
            e.addEventListener('keyup', C));
        }
      }),
    b = document.createElement('div');
  b.className = 'erxes-launcher-container';
  var a = document.createElement('iframe');
  a.id = 'erxes-launcher';
  a.className = 'erxes-launcher';
  a.src = 'about:blank';
  c.appendChild(s);
  b.appendChild(a);
  a.addEventListener('load', z);
  w.append(c, b);
  document.body.appendChild(w);
  var H = () =>
      h(void 0, null, function* () {
        if (!s || !s.contentWindow) {
          console.error('Messenger: Iframe or content window is not available');
          return;
        }
        let t = s.contentWindow;
        ((s.style.display = 'block'), V(t), F(t), (a.style.opacity = '1'));
      }),
    S = () => localStorage.getItem('erxes') || '{}',
    I = (t, e) => {
      let n = window.Erxes || {};
      ((n[t] = e), (window.Erxes = n));
    },
    V = (t) => {
      I('showMessenger', () => {
        t.postMessage({ fromPublisher: !0, action: 'showMessenger' }, '*');
      });
    },
    F = (t) => {
      var n;
      let e = (n = window.erxesSettings) == null ? void 0 : n.messenger;
      t.postMessage({ fromPublisher: !0, settings: e, storage: S() }, '*');
    };
  s.addEventListener('load', H);
  var R = () => {
      if (!s || !s.contentWindow) return;
      s.contentWindow.postMessage(
        { fromPublisher: !0, action: 'toggleMessenger' },
        '*',
      );
    },
    O = (t) =>
      h(void 0, null, function* () {
        let { data: e } = t;
        if (
          (e.fromErxes &&
            e.message === 'connected' &&
            e.apiUrl &&
            (v = e.apiUrl),
          e.fromErxes && e.connectionInfo)
        ) {
          let { connectionInfo: n } = e,
            { widgetsMessengerConnect: m } = n || {},
            { uiOptions: d } = m || {};
          if (!d) return console.error('Messenger: uiOptions is not defined');
          let o = i == null ? void 0 : i.querySelector('.erxes-launcher');
          if (!o)
            return console.error('Messenger: launcher element is not defined');
          let { color: p, logo: g } = d,
            r = g;
          ((x = !!r),
            (u = x ? `url(${v}/read-file?key=${encodeURIComponent(r)})` : u),
            (o.style.cssText = `
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
      background-color: ${p};
      color: ${p || '#673fbd'};
      background-image: ${u};
      background-size: ${x ? 'cover' : '18px'};
      background-position: center;
    `));
        }
      });
  window.addEventListener('message', O);
  window.addEventListener('message', (t) =>
    h(void 0, null, function* () {
      let { data: e } = t,
        { isVisible: n, message: m, isSmallContainer: d } = e || {};
      if (e.fromErxes && e.source === 'fromMessenger') {
        let o = i == null ? void 0 : i.querySelector('.erxes-launcher');
        if (!o)
          return console.error('Messenger: launcher element is not defined');
        (y && document.body.classList.toggle('widget-mobile', n),
          m === 'messenger' &&
            (y && n ? P() : T(),
            n
              ? (c.classList.add('erxes-messenger-shown'),
                c.classList.remove('erxes-messenger-hidden'),
                (o.style.backgroundImage = 'none'),
                (o.innerHTML = X))
              : (c.classList.remove('erxes-messenger-shown'),
                c.classList.add('erxes-messenger-hidden'),
                (o.style.backgroundImage = u),
                (o.style.backgroundSize = x ? 'cover' : '18px'),
                (o.innerHTML = ''))),
          w.classList.toggle('small', d));
      }
    }),
  );
})();
