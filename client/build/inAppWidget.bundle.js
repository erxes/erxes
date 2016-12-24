/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _settings = __webpack_require__(440);

	var _settings2 = _interopRequireDefault(_settings);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var API_URL = _settings2.default.API_URL;

	// add iframe
	/*
	 * InApp message's embeddable script
	 */

	var iframe = document.createElement('iframe');
	iframe.id = 'erxes-iframe';
	iframe.src = API_URL + '/inapp';
	iframe.style.display = 'none';

	document.body.appendChild(iframe);

	// send erxes settings to iframe
	iframe = document.querySelector('#erxes-iframe');

	// after iframe load send connection info
	iframe.onload = function () {
	  iframe.style.display = 'inherit';

	  iframe.contentWindow.postMessage({
	    fromPublisher: true,
	    settings: window.erxesSettings
	  }, '*');
	};

	// create style
	var link = document.createElement('link');

	link.id = 'erxes';
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = API_URL + '/inapp/iframe.css';
	link.media = 'all';

	// add style to head
	var head = document.getElementsByTagName('head')[0];
	head.appendChild(link);

	// listen for widget toggle
	window.addEventListener('message', function (event) {
	  if (event.data.fromErxes) {
	    iframe = document.querySelector('#erxes-iframe');

	    iframe.className = 'erxes-messenger-shown';

	    if (event.data.isMessengerVisible) {
	      iframe.className = 'erxes-messenger-hidden';
	    }
	  }
	});

/***/ },

/***/ 440:
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  WEBSOCKET_URL: 'ws://localhost:3010',
	  DDP_URL: 'ws://127.0.0.1:7010/websocket',
	  API_URL: 'http://localhost:8080'
	};

/***/ }

/******/ });