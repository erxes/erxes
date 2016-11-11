/* globals CDN_HOST */

function onReady() {
  const Erxes = window.Erxes;

  Erxes.connect({
    settings: window.erxesSettings,
    dom: window.document,
  });
}

function loadScript(url, callback) {
  const script = window.document.createElement('script');
  script.async = true;
  script.src = url;

  const entry = window.document.getElementsByTagName('script')[0];
  entry.parentNode.insertBefore(script, entry);

  script.onload = script.onreadystatechange = () => {
    const rdyState = script.readyState;
    if (!rdyState || /complete|loaded/.test(script.readyState)) {
      callback();
      script.onload = null;
      script.onreadystatechange = null;
    }
  };
}

loadScript(`${CDN_HOST}/erxes.js`, onReady);
