/* eslint-disable */

'use strict';

(function (window, undefined) {

  // add iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'erxes-iframe';
  iframe.src = 'http://localhost:8080/inapp';
  iframe.className = 'erxes-messenger-hidden';

  document.body.appendChild(iframe);

  // send erxes settings to iframe
  iframe = document.querySelector('#erxes-iframe');

  iframe.onload = function () {
    iframe.contentWindow.postMessage({
      fromPublisher: true,
      settings: window.erxesSettings,
    }, '*');
  }

  // add style
  var head  = document.getElementsByTagName('head')[0];
  var link  = document.createElement('link');
  link.id   = 'erxes';
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = 'http://localhost:8080/iframe.css';
  link.media = 'all';
  head.appendChild(link);

  // listen for widget toggle
  window.addEventListener('message', function (event) {
    if (event.data.fromErxes) {
      var iframe = document.querySelector('#erxes-iframe');

      iframe.className = 'erxes-messenger-shown';

      if (event.data.isMessengerVisible) {
        iframe.className = 'erxes-messenger-hidden';
      }
    }
  });
})(window);
