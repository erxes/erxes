/* globals CDN_HOST */

function loadScript(url, callback) {
  // create a new script tag with given url
  const script = window.document.createElement('script');
  script.async = true;
  script.src = url;

  // append the script to the body
  const firstScriptTag = window.document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

  script.onload = script.onreadystatechange = () => {
    const { readyState } = script;
    if (!readyState || /complete|loaded/.test(readyState)) {
      callback();

      script.onload = script.onreadystatechange = null;
    }
  };
}

loadScript(`${CDN_HOST}/erxes.js`, () => {
  const { connect } = window.Erxes;

  connect({
    settings: window.erxesSettings,
    dom: window.document,
  });
});
