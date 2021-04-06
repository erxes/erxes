/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./client/messenger/widget/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./client/messenger/widget/index.css":
/*!*******************************************!*\
  !*** ./client/messenger/widget/index.css ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(/*! !../../../node_modules/css-loader!./index.css */ "./node_modules/css-loader/index.js!./client/messenger/widget/index.css");
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(/*! ../../../node_modules/style-loader/addStyles.js */ "./node_modules/style-loader/addStyles.js")(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ "./client/messenger/widget/index.ts":
/*!******************************************!*\
  !*** ./client/messenger/widget/index.ts ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// css
__webpack_require__(/*! ./index.css */ "./client/messenger/widget/index.css");
var widgetUtils_1 = __webpack_require__(/*! ../../widgetUtils */ "./client/widgetUtils.ts");
/*
 * Messenger message's embeddable script
 */
// check is mobile
var isMobile = navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i);
var viewportMeta;
var newViewportMeta;
var hideDelayTimer;
var delay = 350;
if (isMobile) {
    viewportMeta = document.querySelector('meta[name="viewport"]');
}
function renewViewPort() {
    if (viewportMeta) {
        document.getElementsByTagName("head")[0].removeChild(viewportMeta);
    }
    newViewportMeta = document.createElement("meta");
    newViewportMeta.name = "viewport";
    newViewportMeta.content =
        "initial-scale=1, user-scalable=0, maximum-scale=1, width=device-width";
    document.getElementsByTagName("head")[0].appendChild(newViewportMeta);
}
function revertViewPort() {
    if (newViewportMeta) {
        document.getElementsByTagName("head")[0].removeChild(newViewportMeta);
    }
    if (viewportMeta) {
        document.getElementsByTagName("head")[0].appendChild(viewportMeta);
    }
}
function delaydToggleClass(str, isVisible) {
    hideDelayTimer = setTimeout(function () {
        erxesContainer.classList.toggle(str, isVisible);
    }, delay);
}
function delaydSetClass(str) {
    hideDelayTimer = setTimeout(function () {
        erxesContainer.className = str;
    }, delay);
}
function clearTimer() {
    if (hideDelayTimer) {
        clearTimeout(hideDelayTimer);
    }
}
var iframeId = "erxes-messenger-iframe";
var container = "erxes-messenger-container";
// container
var erxesContainer = document.createElement("div");
erxesContainer.id = container;
erxesContainer.className = "erxes-messenger-hidden";
// add iframe
var iframe = document.createElement("iframe");
iframe.id = iframeId;
iframe.src = widgetUtils_1.generateIntegrationUrl("messenger");
iframe.style.display = "none";
iframe.allow = "camera *;microphone *";
erxesContainer.appendChild(iframe);
document.body.appendChild(erxesContainer);
// after iframe load send connection info
iframe.onload = function () { return __awaiter(void 0, void 0, void 0, function () {
    var contentWindow, setting;
    return __generator(this, function (_a) {
        iframe.style.display = "block";
        contentWindow = iframe.contentWindow;
        if (!contentWindow) {
            return [2 /*return*/];
        }
        setting = window.erxesSettings.messenger;
        widgetUtils_1.setErxesProperty("showMessenger", function () {
            contentWindow.postMessage({
                fromPublisher: true,
                action: "showMessenger"
            }, "*");
        });
        contentWindow.postMessage({
            fromPublisher: true,
            setting: setting,
            storage: widgetUtils_1.getStorage()
        }, "*");
        return [2 /*return*/];
    });
}); };
// listen for widget toggle
window.addEventListener("message", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var data, isVisible, message, isSmallContainer;
    return __generator(this, function (_a) {
        data = event.data;
        isVisible = data.isVisible, message = data.message, isSmallContainer = data.isSmallContainer;
        widgetUtils_1.listenForCommonRequests(event, iframe);
        if (data.fromErxes && data.source === "fromMessenger") {
            if (isMobile) {
                document.body.classList.toggle("widget-mobile", isVisible);
            }
            if (message === "messenger") {
                if (isMobile && isVisible) {
                    renewViewPort();
                }
                else {
                    revertViewPort();
                }
                clearTimer();
                if (isVisible) {
                    erxesContainer.className = "erxes-messenger-shown";
                }
                else {
                    delaydSetClass("erxes-messenger-hidden");
                }
                erxesContainer.classList.toggle("small", isSmallContainer);
                document.body.classList.toggle("messenger-widget-shown", isVisible);
            }
            if (message === "notifier") {
                clearTimer();
                delaydToggleClass("erxes-notifier-shown", isVisible);
                // change container div dimension
                if (!isVisible) {
                    delaydSetClass("erxes-messenger-hidden");
                }
            }
            if (message === "notifierFull") {
                clearTimer();
                // add class and hide notifier
                if (isVisible) {
                    erxesContainer.className += " erxes-notifier-shown fullMessage";
                }
                else {
                    delaydSetClass("erxes-messenger-hidden");
                }
            }
        }
        return [2 /*return*/];
    });
}); });


/***/ }),

/***/ "./client/widgetUtils.ts":
/*!*******************************!*\
  !*** ./client/widgetUtils.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorId = exports.setErxesProperty = exports.postMessage = exports.getBrowserInfo = exports.generateIntegrationUrl = exports.listenForCommonRequests = exports.getStorage = exports.getEnv = void 0;
var fingerprintjs_1 = __webpack_require__(/*! @fingerprintjs/fingerprintjs */ "./node_modules/@fingerprintjs/fingerprintjs/dist/fp.esm.js");
exports.getEnv = function () {
    return window.erxesEnv;
};
exports.getStorage = function () {
    return localStorage.getItem("erxes") || "{}";
};
exports.listenForCommonRequests = function (event, iframe) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, fromErxes, source, key, value, _b, _c, _d, erxesStorage;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = event.data, message = _a.message, fromErxes = _a.fromErxes, source = _a.source, key = _a.key, value = _a.value;
                if (!(fromErxes && iframe.contentWindow)) return [3 /*break*/, 3];
                if (!(message === "requestingBrowserInfo")) return [3 /*break*/, 2];
                _c = (_b = iframe.contentWindow).postMessage;
                _d = {
                    fromPublisher: true,
                    source: source,
                    message: "sendingBrowserInfo"
                };
                return [4 /*yield*/, exports.getBrowserInfo()];
            case 1:
                _c.apply(_b, [(_d.browserInfo = _e.sent(),
                        _d), "*"]);
                _e.label = 2;
            case 2:
                if (message === "setLocalStorageItem") {
                    erxesStorage = JSON.parse(localStorage.getItem("erxes") || "{}");
                    erxesStorage[key] = value;
                    localStorage.setItem("erxes", JSON.stringify(erxesStorage));
                }
                _e.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
/*
 * Generate <host>/<integration kind> from <host>/<integration kind>Widget.bundle.js
 */
exports.generateIntegrationUrl = function (integrationKind) {
    var script = document.currentScript ||
        (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
    if (script && script instanceof HTMLScriptElement) {
        return script.src.replace("/build/" + integrationKind + "Widget.bundle.js", "/" + integrationKind);
    }
    return '';
};
exports.getBrowserInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var location, response, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (window.location.hostname === 'localhost') {
                    return [2 /*return*/, {
                            url: window.location.pathname,
                            hostname: window.location.href,
                            language: navigator.language,
                            userAgent: navigator.userAgent
                        }];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch('https://geo.erxes.io')];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                location = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                location = {
                    city: '',
                    remoteAddress: '',
                    region: '',
                    country: '',
                    countryCode: ''
                };
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/, {
                    remoteAddress: location.network,
                    region: location.region,
                    countryCode: location.countryCode,
                    city: location.city,
                    country: location.countryName,
                    url: window.location.pathname,
                    hostname: window.location.origin,
                    language: navigator.language,
                    userAgent: navigator.userAgent
                }];
        }
    });
}); };
exports.postMessage = function (source, message, postData) {
    if (postData === void 0) { postData = {}; }
    window.parent.postMessage(__assign({ fromErxes: true, source: source,
        message: message }, postData), '*');
};
exports.setErxesProperty = function (name, value) {
    var erxes = window.Erxes || {};
    erxes[name] = value;
    window.Erxes = erxes;
};
exports.getVisitorId = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fp, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fingerprintjs_1.default.load()];
            case 1:
                fp = _a.sent();
                return [4 /*yield*/, fp.get()];
            case 2:
                result = _a.sent();
                // This is the visitor identifier:
                return [2 /*return*/, result.visitorId];
        }
    });
}); };


/***/ }),

/***/ "./node_modules/@fingerprintjs/fingerprintjs/dist/fp.esm.js":
/*!******************************************************************!*\
  !*** ./node_modules/@fingerprintjs/fingerprintjs/dist/fp.esm.js ***!
  \******************************************************************/
/*! exports provided: default, componentsToDebugString, getComponents, hashComponents, isChromium, isDesktopSafari, isEdgeHTML, isGecko, isTrident, isWebKit, load, murmurX64Hash128 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "componentsToDebugString", function() { return componentsToDebugString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getComponents", function() { return getComponents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hashComponents", function() { return hashComponents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isChromium", function() { return isChromium; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDesktopSafari", function() { return isDesktopSafari; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isEdgeHTML", function() { return isEdgeHTML; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isGecko", function() { return isGecko; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTrident", function() { return isTrident; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWebKit", function() { return isWebKit; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "load", function() { return load; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "murmurX64Hash128", function() { return murmurX64Hash128; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/**
 * FingerprintJS v3.0.5 - Copyright (c) FingerprintJS, Inc, 2021 (https://fingerprintjs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 *
 * This software contains code from open-source projects:
 * MurmurHash3 by Karan Lyons (https://github.com/karanlyons/murmurHash3.js)
 */



/*
 * Taken from https://github.com/karanlyons/murmurHash3.js/blob/a33d0723127e2e5415056c455f8aed2451ace208/murmurHash3.js
 */
//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// added together as a 64bit int (as an array of two 32bit ints).
//
function x64Add(m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
    var o = [0, 0, 0, 0];
    o[3] += m[3] + n[3];
    o[2] += o[3] >>> 16;
    o[3] &= 0xffff;
    o[2] += m[2] + n[2];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[1] += m[1] + n[1];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[0] += m[0] + n[0];
    o[0] &= 0xffff;
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
}
//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// multiplied together as a 64bit int (as an array of two 32bit ints).
//
function x64Multiply(m, n) {
    m = [m[0] >>> 16, m[0] & 0xffff, m[1] >>> 16, m[1] & 0xffff];
    n = [n[0] >>> 16, n[0] & 0xffff, n[1] >>> 16, n[1] & 0xffff];
    var o = [0, 0, 0, 0];
    o[3] += m[3] * n[3];
    o[2] += o[3] >>> 16;
    o[3] &= 0xffff;
    o[2] += m[2] * n[3];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[2] += m[3] * n[2];
    o[1] += o[2] >>> 16;
    o[2] &= 0xffff;
    o[1] += m[1] * n[3];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[1] += m[2] * n[2];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[1] += m[3] * n[1];
    o[0] += o[1] >>> 16;
    o[1] &= 0xffff;
    o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
    o[0] &= 0xffff;
    return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
}
//
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) rotated left by that number of positions.
//
function x64Rotl(m, n) {
    n %= 64;
    if (n === 32) {
        return [m[1], m[0]];
    }
    else if (n < 32) {
        return [(m[0] << n) | (m[1] >>> (32 - n)), (m[1] << n) | (m[0] >>> (32 - n))];
    }
    else {
        n -= 32;
        return [(m[1] << n) | (m[0] >>> (32 - n)), (m[0] << n) | (m[1] >>> (32 - n))];
    }
}
//
// Given a 64bit int (as an array of two 32bit ints) and an int
// representing a number of bit positions, returns the 64bit int (as an
// array of two 32bit ints) shifted left by that number of positions.
//
function x64LeftShift(m, n) {
    n %= 64;
    if (n === 0) {
        return m;
    }
    else if (n < 32) {
        return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
    }
    else {
        return [m[1] << (n - 32), 0];
    }
}
//
// Given two 64bit ints (as an array of two 32bit ints) returns the two
// xored together as a 64bit int (as an array of two 32bit ints).
//
function x64Xor(m, n) {
    return [m[0] ^ n[0], m[1] ^ n[1]];
}
//
// Given a block, returns murmurHash3's final x64 mix of that block.
// (`[0, h[0] >>> 1]` is a 33 bit unsigned right shift. This is the
// only place where we need to right shift 64bit ints.)
//
function x64Fmix(h) {
    h = x64Xor(h, [0, h[0] >>> 1]);
    h = x64Multiply(h, [0xff51afd7, 0xed558ccd]);
    h = x64Xor(h, [0, h[0] >>> 1]);
    h = x64Multiply(h, [0xc4ceb9fe, 0x1a85ec53]);
    h = x64Xor(h, [0, h[0] >>> 1]);
    return h;
}
//
// Given a string and an optional seed as an int, returns a 128 bit
// hash using the x64 flavor of MurmurHash3, as an unsigned hex.
//
function x64hash128(key, seed) {
    key = key || '';
    seed = seed || 0;
    var remainder = key.length % 16;
    var bytes = key.length - remainder;
    var h1 = [0, seed];
    var h2 = [0, seed];
    var k1 = [0, 0];
    var k2 = [0, 0];
    var c1 = [0x87c37b91, 0x114253d5];
    var c2 = [0x4cf5ad43, 0x2745937f];
    var i;
    for (i = 0; i < bytes; i = i + 16) {
        k1 = [
            (key.charCodeAt(i + 4) & 0xff) |
                ((key.charCodeAt(i + 5) & 0xff) << 8) |
                ((key.charCodeAt(i + 6) & 0xff) << 16) |
                ((key.charCodeAt(i + 7) & 0xff) << 24),
            (key.charCodeAt(i) & 0xff) |
                ((key.charCodeAt(i + 1) & 0xff) << 8) |
                ((key.charCodeAt(i + 2) & 0xff) << 16) |
                ((key.charCodeAt(i + 3) & 0xff) << 24),
        ];
        k2 = [
            (key.charCodeAt(i + 12) & 0xff) |
                ((key.charCodeAt(i + 13) & 0xff) << 8) |
                ((key.charCodeAt(i + 14) & 0xff) << 16) |
                ((key.charCodeAt(i + 15) & 0xff) << 24),
            (key.charCodeAt(i + 8) & 0xff) |
                ((key.charCodeAt(i + 9) & 0xff) << 8) |
                ((key.charCodeAt(i + 10) & 0xff) << 16) |
                ((key.charCodeAt(i + 11) & 0xff) << 24),
        ];
        k1 = x64Multiply(k1, c1);
        k1 = x64Rotl(k1, 31);
        k1 = x64Multiply(k1, c2);
        h1 = x64Xor(h1, k1);
        h1 = x64Rotl(h1, 27);
        h1 = x64Add(h1, h2);
        h1 = x64Add(x64Multiply(h1, [0, 5]), [0, 0x52dce729]);
        k2 = x64Multiply(k2, c2);
        k2 = x64Rotl(k2, 33);
        k2 = x64Multiply(k2, c1);
        h2 = x64Xor(h2, k2);
        h2 = x64Rotl(h2, 31);
        h2 = x64Add(h2, h1);
        h2 = x64Add(x64Multiply(h2, [0, 5]), [0, 0x38495ab5]);
    }
    k1 = [0, 0];
    k2 = [0, 0];
    switch (remainder) {
        case 15:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 14)], 48));
        // fallthrough
        case 14:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 13)], 40));
        // fallthrough
        case 13:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 12)], 32));
        // fallthrough
        case 12:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 11)], 24));
        // fallthrough
        case 11:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 10)], 16));
        // fallthrough
        case 10:
            k2 = x64Xor(k2, x64LeftShift([0, key.charCodeAt(i + 9)], 8));
        // fallthrough
        case 9:
            k2 = x64Xor(k2, [0, key.charCodeAt(i + 8)]);
            k2 = x64Multiply(k2, c2);
            k2 = x64Rotl(k2, 33);
            k2 = x64Multiply(k2, c1);
            h2 = x64Xor(h2, k2);
        // fallthrough
        case 8:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 7)], 56));
        // fallthrough
        case 7:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 6)], 48));
        // fallthrough
        case 6:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 5)], 40));
        // fallthrough
        case 5:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 4)], 32));
        // fallthrough
        case 4:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 3)], 24));
        // fallthrough
        case 3:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 2)], 16));
        // fallthrough
        case 2:
            k1 = x64Xor(k1, x64LeftShift([0, key.charCodeAt(i + 1)], 8));
        // fallthrough
        case 1:
            k1 = x64Xor(k1, [0, key.charCodeAt(i)]);
            k1 = x64Multiply(k1, c1);
            k1 = x64Rotl(k1, 31);
            k1 = x64Multiply(k1, c2);
            h1 = x64Xor(h1, k1);
        // fallthrough
    }
    h1 = x64Xor(h1, [0, key.length]);
    h2 = x64Xor(h2, [0, key.length]);
    h1 = x64Add(h1, h2);
    h2 = x64Add(h2, h1);
    h1 = x64Fmix(h1);
    h2 = x64Fmix(h2);
    h1 = x64Add(h1, h2);
    h2 = x64Add(h2, h1);
    return (('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
        ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8));
}

var version = "3.0.5";

var w = window;
function requestIdleCallbackIfAvailable(fallbackTimeout, deadlineTimeout) {
    if (deadlineTimeout === void 0) { deadlineTimeout = Infinity; }
    return new Promise(function (resolve) {
        if (w.requestIdleCallback) {
            w.requestIdleCallback(function () { return resolve(); }, { timeout: deadlineTimeout });
        }
        else {
            setTimeout(resolve, Math.min(fallbackTimeout, deadlineTimeout));
        }
    });
}

/**
 * Converts an error object to a plain object that can be used with `JSON.stringify`.
 * If you just run `JSON.stringify(error)`, you'll get `'{}'`.
 */
function errorToObject(error) {
    var _a;
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({ name: error.name, message: error.message, stack: (_a = error.stack) === null || _a === void 0 ? void 0 : _a.split('\n') }, error);
}

/*
 * This file contains functions to work with pure data only (no browser features, DOM, side effects, etc).
 */
/**
 * Does the same as Array.prototype.includes but has better typing
 */
function includes(haystack, needle) {
    for (var i = 0, l = haystack.length; i < l; ++i) {
        if (haystack[i] === needle) {
            return true;
        }
    }
    return false;
}
/**
 * Like `!includes()` but with proper typing
 */
function excludes(haystack, needle) {
    return !includes(haystack, needle);
}
/**
 * Be careful, NaN can return
 */
function toInt(value) {
    return parseInt(value);
}
/**
 * Be careful, NaN can return
 */
function toFloat(value) {
    return parseFloat(value);
}
function replaceNaN(value, replacement) {
    return typeof value === 'number' && isNaN(value) ? replacement : value;
}
function countTruthy(values) {
    return values.reduce(function (sum, value) { return sum + (value ? 1 : 0); }, 0);
}

/*
 * Functions to help with features that vary through browsers
 */
var w$1 = window;
var n = navigator;
var d = document;
/**
 * Checks whether the browser is based on Trident (the Internet Explorer engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isTrident() {
    // The properties are checked to be in IE 10, IE 11 and not to be in other browsers in October 2020
    return (countTruthy([
        'MSCSSMatrix' in w$1,
        'msSetImmediate' in w$1,
        'msIndexedDB' in w$1,
        'msMaxTouchPoints' in n,
        'msPointerEnabled' in n,
    ]) >= 4);
}
/**
 * Checks whether the browser is based on EdgeHTML (the pre-Chromium Edge engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isEdgeHTML() {
    // Based on research in October 2020
    return (countTruthy(['msWriteProfilerMark' in w$1, 'MSStream' in w$1, 'msLaunchUri' in n, 'msSaveBlob' in n]) >= 3 &&
        !isTrident());
}
/**
 * Checks whether the browser is based on Chromium without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isChromium() {
    // Based on research in October 2020. Tested to detect Chromium 42-86.
    return (countTruthy([
        'webkitPersistentStorage' in n,
        'webkitTemporaryStorage' in n,
        n.vendor.indexOf('Google') === 0,
        'webkitResolveLocalFileSystemURL' in w$1,
        'BatteryManager' in w$1,
        'webkitMediaStream' in w$1,
        'webkitSpeechGrammar' in w$1,
    ]) >= 5);
}
/**
 * Checks whether the browser is based on mobile or desktop Safari without using user-agent.
 * All iOS browsers use WebKit (the Safari engine).
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isWebKit() {
    // Based on research in September 2020
    return (countTruthy([
        'ApplePayError' in w$1,
        'CSSPrimitiveValue' in w$1,
        'Counter' in w$1,
        n.vendor.indexOf('Apple') === 0,
        'getStorageUpdates' in n,
        'WebKitMediaKeys' in w$1,
    ]) >= 4);
}
/**
 * Checks whether the WebKit browser is a desktop Safari.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isDesktopSafari() {
    return (countTruthy([
        'safari' in w$1,
        !('DeviceMotionEvent' in w$1),
        !('ongestureend' in w$1),
        !('standalone' in n),
    ]) >= 3);
}
/**
 * Checks whether the browser is based on Gecko (Firefox engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isGecko() {
    var _a;
    // Based on research in September 2020
    return (countTruthy([
        'buildID' in n,
        ((_a = d.documentElement) === null || _a === void 0 ? void 0 : _a.style) && 'MozAppearance' in d.documentElement.style,
        'MediaRecorderErrorEvent' in w$1,
        'mozInnerScreenX' in w$1,
        'CSSMozDocumentRule' in w$1,
        'CanvasCaptureMediaStream' in w$1,
    ]) >= 4);
}
/**
 * Checks whether the browser is based on Chromium version ≥86 without using user-agent.
 * It doesn't check that the browser is based on Chromium, there is a separate function for this.
 */
function isChromium86OrNewer() {
    // Checked in Chrome 85 vs Chrome 86 both on desktop and Android
    return (countTruthy([
        !('MediaSettingsRange' in w$1),
        'RTCEncodedAudioFrame' in w$1,
        '' + w$1.Intl === '[object Intl]',
        '' + w$1.Reflect === '[object Reflect]',
    ]) >= 3);
}
/**
 * Checks whether the browser is based on WebKit version ≥606 (Safari ≥12) without using user-agent.
 * It doesn't check that the browser is based on WebKit, there is a separate function for this.
 *
 * @link https://en.wikipedia.org/wiki/Safari_version_history#Release_history Safari-WebKit versions map
 */
function isWebKit606OrNewer() {
    // Checked in Safari 9–14
    return (countTruthy([
        'DOMRectList' in w$1,
        'RTCPeerConnectionIceEvent' in w$1,
        'SVGGeometryElement' in w$1,
        'ontransitioncancel' in w$1,
    ]) >= 3);
}

var w$2 = window;
var d$1 = document;
// Inspired by and based on https://github.com/cozylife/audio-fingerprint
function getAudioFingerprint() {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
        var AudioContext, context, oscillator, compressor, buffer, error_1;
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_a) {
            switch (_a.label) {
                case 0:
                    AudioContext = w$2.OfflineAudioContext || w$2.webkitOfflineAudioContext;
                    if (!AudioContext) {
                        return [2 /*return*/, -2 /* NotSupported */];
                    }
                    // In some browsers, audio context always stays suspended unless the context is started in response to a user action
                    // (e.g. a click or a tap). It prevents audio fingerprint from being taken at an arbitrary moment of time.
                    // Such browsers are old and unpopular, so the audio fingerprinting is just skipped in them.
                    // See a similar case explanation at https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
                    if (doesCurrentBrowserSuspendAudioContext()) {
                        return [2 /*return*/, -1 /* KnownToSuspend */];
                    }
                    context = new AudioContext(1, 44100, 44100);
                    oscillator = context.createOscillator();
                    oscillator.type = 'triangle';
                    setAudioParam(context, oscillator.frequency, 10000);
                    compressor = context.createDynamicsCompressor();
                    setAudioParam(context, compressor.threshold, -50);
                    setAudioParam(context, compressor.knee, 40);
                    setAudioParam(context, compressor.ratio, 12);
                    setAudioParam(context, compressor.reduction, -20);
                    setAudioParam(context, compressor.attack, 0);
                    setAudioParam(context, compressor.release, 0.25);
                    oscillator.connect(compressor);
                    compressor.connect(context.destination);
                    oscillator.start(0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, renderAudio(context)];
                case 2:
                    buffer = _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    if (error_1.name === "timeout" /* Timeout */ || error_1.name === "suspended" /* Suspended */) {
                        return [2 /*return*/, -3 /* Timeout */];
                    }
                    throw error_1;
                case 4:
                    oscillator.disconnect();
                    compressor.disconnect();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/, getHash(buffer.getChannelData(0))];
            }
        });
    });
}
/**
 * Checks if the current browser is known to always suspend audio context
 */
function doesCurrentBrowserSuspendAudioContext() {
    return isWebKit() && !isDesktopSafari() && !isWebKit606OrNewer();
}
function setAudioParam(context, param, value) {
    var isAudioParam = function (value) {
        return value && typeof value.setValueAtTime === 'function';
    };
    if (isAudioParam(param)) {
        param.setValueAtTime(value, context.currentTime);
    }
}
function renderAudio(context) {
    var resumeTriesMaxCount = 3;
    var resumeRetryDelay = 500;
    var runningTimeout = 1000;
    return new Promise(function (resolve, reject) {
        context.oncomplete = function (event) { return resolve(event.renderedBuffer); };
        var resumeTriesLeft = resumeTriesMaxCount;
        var tryResume = function () {
            context.startRendering();
            switch (context.state) {
                case 'running':
                    setTimeout(function () { return reject(makeInnerError("timeout" /* Timeout */)); }, runningTimeout);
                    break;
                // Sometimes the audio context doesn't start after calling `startRendering` (in addition to the cases where
                // audio context doesn't start at all). A known case is starting an audio context when the browser tab is in
                // background on iPhone. Retries usually help in this case.
                case 'suspended':
                    // The audio context can reject starting until the tab is in foreground. Long fingerprint duration
                    // in background isn't a problem, therefore the retry attempts don't count in background. It can lead to
                    // a situation when a fingerprint takes very long time and finishes successfully. FYI, the audio context
                    // can be suspended when `document.hidden === false` and start running after a retry.
                    if (!d$1.hidden) {
                        resumeTriesLeft--;
                    }
                    if (resumeTriesLeft > 0) {
                        setTimeout(tryResume, resumeRetryDelay);
                    }
                    else {
                        reject(makeInnerError("suspended" /* Suspended */));
                    }
                    break;
            }
        };
        tryResume();
    });
}
function getHash(signal) {
    var hash = 0;
    for (var i = 4500; i < 5000; ++i) {
        hash += Math.abs(signal[i]);
    }
    return hash;
}
function makeInnerError(name) {
    var error = new Error(name);
    error.name = name;
    return error;
}

var d$2 = document;
// We use m or w because these two characters take up the maximum width.
// And we use a LLi so that the same matching fonts can get separated.
var testString = 'mmMwWLliI0O&1';
// We test using 48px font size, we may use any size. I guess larger the better.
var testSize = '48px';
// A font will be compared against all the three default fonts.
// And if it doesn't match all 3 then that font is not available.
var baseFonts = ['monospace', 'sans-serif', 'serif'];
var fontList = [
    // This is android-specific font from "Roboto" family
    'sans-serif-thin',
    'ARNO PRO',
    'Agency FB',
    'Arabic Typesetting',
    'Arial Unicode MS',
    'AvantGarde Bk BT',
    'BankGothic Md BT',
    'Batang',
    'Bitstream Vera Sans Mono',
    'Calibri',
    'Century',
    'Century Gothic',
    'Clarendon',
    'EUROSTILE',
    'Franklin Gothic',
    'Futura Bk BT',
    'Futura Md BT',
    'GOTHAM',
    'Gill Sans',
    'HELV',
    'Haettenschweiler',
    'Helvetica Neue',
    'Humanst521 BT',
    'Leelawadee',
    'Letter Gothic',
    'Levenim MT',
    'Lucida Bright',
    'Lucida Sans',
    'Menlo',
    'MS Mincho',
    'MS Outlook',
    'MS Reference Specialty',
    'MS UI Gothic',
    'MT Extra',
    'MYRIAD PRO',
    'Marlett',
    'Meiryo UI',
    'Microsoft Uighur',
    'Minion Pro',
    'Monotype Corsiva',
    'PMingLiU',
    'Pristina',
    'SCRIPTINA',
    'Segoe UI Light',
    'Serifa',
    'SimHei',
    'Small Fonts',
    'Staccato222 BT',
    'TRAJAN PRO',
    'Univers CE 55 Medium',
    'Vrinda',
    'ZWAdobeF',
];
var fontSpanStyle = {
    // CSS font reset to reset external styles
    fontStyle: 'normal',
    fontWeight: 'normal',
    letterSpacing: 'normal',
    lineBreak: 'auto',
    lineHeight: 'normal',
    textTransform: 'none',
    textAlign: 'left',
    textDecoration: 'none',
    textShadow: 'none',
    whiteSpace: 'normal',
    wordBreak: 'normal',
    wordSpacing: 'normal',
    // We need this css as in some weird browser this span elements shows up for a microSec which creates
    // a bad user experience
    position: 'absolute',
    left: '-9999px',
    fontSize: testSize,
};
// kudos to http://www.lalit.org/lab/javascript-css-font-detect/
function getFonts() {
    var h = d$2.body;
    // div to load spans for the base fonts
    var baseFontsDiv = d$2.createElement('div');
    // div to load spans for the fonts to detect
    var fontsDiv = d$2.createElement('div');
    var defaultWidth = {};
    var defaultHeight = {};
    // creates a span where the fonts will be loaded
    var createSpan = function () {
        var span = d$2.createElement('span');
        span.textContent = testString;
        for (var _i = 0, _a = Object.keys(fontSpanStyle); _i < _a.length; _i++) {
            var prop = _a[_i];
            span.style[prop] = fontSpanStyle[prop];
        }
        return span;
    };
    // creates a span and load the font to detect and a base font for fallback
    var createSpanWithFonts = function (fontToDetect, baseFont) {
        var s = createSpan();
        s.style.fontFamily = "'" + fontToDetect + "'," + baseFont;
        return s;
    };
    // creates spans for the base fonts and adds them to baseFontsDiv
    var initializeBaseFontsSpans = function () {
        return baseFonts.map(function (baseFont) {
            var s = createSpan();
            s.style.fontFamily = baseFont;
            baseFontsDiv.appendChild(s);
            return s;
        });
    };
    // creates spans for the fonts to detect and adds them to fontsDiv
    var initializeFontsSpans = function () {
        // Stores {fontName : [spans for that font]}
        var spans = {};
        var _loop_1 = function (font) {
            spans[font] = baseFonts.map(function (baseFont) {
                var s = createSpanWithFonts(font, baseFont);
                fontsDiv.appendChild(s);
                return s;
            });
        };
        for (var _i = 0, fontList_1 = fontList; _i < fontList_1.length; _i++) {
            var font = fontList_1[_i];
            _loop_1(font);
        }
        return spans;
    };
    // checks if a font is available
    var isFontAvailable = function (fontSpans) {
        return baseFonts.some(function (baseFont, baseFontIndex) {
            return fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
                fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont];
        });
    };
    // create spans for base fonts
    var baseFontsSpans = initializeBaseFontsSpans();
    // add the spans to the DOM
    h.appendChild(baseFontsDiv);
    // get the default width for the three base fonts
    for (var index = 0, length_1 = baseFonts.length; index < length_1; index++) {
        defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth; // width for the default font
        defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight; // height for the default font
    }
    // create spans for fonts to detect
    var fontsSpans = initializeFontsSpans();
    // add all the spans to the DOM
    h.appendChild(fontsDiv);
    // check available fonts
    var available = [];
    for (var i = 0, l = fontList.length; i < l; i++) {
        if (isFontAvailable(fontsSpans[fontList[i]])) {
            available.push(fontList[i]);
        }
    }
    // remove spans from DOM
    h.removeChild(fontsDiv);
    h.removeChild(baseFontsDiv);
    return available;
}

function getPlugins() {
    if (isTrident()) {
        return [];
    }
    if (!navigator.plugins) {
        return undefined;
    }
    var plugins = [];
    // Safari 10 doesn't support iterating navigator.plugins with for...of
    for (var i = 0; i < navigator.plugins.length; ++i) {
        var plugin = navigator.plugins[i];
        if (!plugin) {
            continue;
        }
        var mimeTypes = [];
        for (var j = 0; j < plugin.length; ++j) {
            var mimeType = plugin[j];
            mimeTypes.push({
                type: mimeType.type,
                suffixes: mimeType.suffixes,
            });
        }
        plugins.push({
            name: plugin.name,
            description: plugin.description,
            mimeTypes: mimeTypes,
        });
    }
    return plugins;
}

function makeCanvasContext() {
    var canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 140;
    canvas.style.display = 'inline';
    return [canvas, canvas.getContext('2d')];
}
function isSupported(canvas, context) {
    // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    return !!(context && canvas.toDataURL);
}
function save(canvas) {
    // TODO: look into: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    return canvas.toDataURL();
}
// https://www.browserleaks.com/canvas#how-does-it-work
function getCanvasFingerprint() {
    var _a = makeCanvasContext(), canvas = _a[0], context = _a[1];
    if (!isSupported(canvas, context)) {
        return { winding: false, data: '' };
    }
    // detect browser support of canvas winding
    // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas/winding.js
    context.rect(0, 0, 10, 10);
    context.rect(2, 2, 6, 6);
    var winding = !context.isPointInPath(5, 5, 'evenodd');
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#f60';
    context.fillRect(125, 1, 62, 20);
    context.fillStyle = '#069';
    // https://github.com/Valve/fingerprintjs2/issues/66
    // this can affect FP generation when applying different CSS on different websites
    context.font = '11pt no-real-font-123';
    // the choice of emojis has a gigantic impact on rendering performance (especially in FF)
    // some newer emojis cause it to slow down 50-200 times
    // context.fillText("Cw爨m fjordbank \ud83d\ude03 gly", 2, 15)
    var printedText = 'Cwm fjordbank \ud83d\ude03 gly';
    context.fillText(printedText, 2, 15);
    context.fillStyle = 'rgba(102, 204, 0, 0.2)';
    context.font = '18pt Arial';
    context.fillText(printedText, 4, 45);
    // canvas blending
    // http://blogs.adobe.com/webplatform/2013/01/28/blending-features-in-canvas/
    // http://jsfiddle.net/NDYV8/16/
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = 'rgb(255,0,255)';
    context.beginPath();
    context.arc(50, 50, 50, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
    context.fillStyle = 'rgb(0,255,255)';
    context.beginPath();
    context.arc(100, 50, 50, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
    context.fillStyle = 'rgb(255,255,0)';
    context.beginPath();
    context.arc(75, 100, 50, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
    context.fillStyle = 'rgb(255,0,255)';
    // canvas winding
    // http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
    // http://jsfiddle.net/NDYV8/19/
    context.arc(75, 75, 75, 0, Math.PI * 2, true);
    context.arc(75, 75, 25, 0, Math.PI * 2, true);
    context.fill('evenodd');
    return {
        winding: winding,
        data: save(canvas),
    };
}

var n$1 = navigator;
var w$3 = window;
/**
 * This is a crude and primitive touch screen detection. It's not possible to currently reliably detect the availability
 * of a touch screen with a JS, without actually subscribing to a touch event.
 *
 * @see http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
 * @see https://github.com/Modernizr/Modernizr/issues/548
 */
function getTouchSupport() {
    var maxTouchPoints = 0;
    var touchEvent;
    if (n$1.maxTouchPoints !== undefined) {
        maxTouchPoints = toInt(n$1.maxTouchPoints);
    }
    else if (n$1.msMaxTouchPoints !== undefined) {
        maxTouchPoints = n$1.msMaxTouchPoints;
    }
    try {
        document.createEvent('TouchEvent');
        touchEvent = true;
    }
    catch (_) {
        touchEvent = false;
    }
    var touchStart = 'ontouchstart' in w$3;
    return {
        maxTouchPoints: maxTouchPoints,
        touchEvent: touchEvent,
        touchStart: touchStart,
    };
}

function getOsCpu() {
    return navigator.oscpu;
}

var n$2 = navigator;
function getLanguages() {
    var result = [];
    var language = n$2.language || n$2.userLanguage || n$2.browserLanguage || n$2.systemLanguage;
    if (language !== undefined) {
        result.push([language]);
    }
    if (Array.isArray(n$2.languages)) {
        // Starting from Chromium 86, there is only a single value in `navigator.language` in Incognito mode:
        // the value of `navigator.language`. Therefore the value is ignored in this browser.
        if (!(isChromium() && isChromium86OrNewer())) {
            result.push(n$2.languages);
        }
    }
    else if (typeof n$2.languages === 'string') {
        var languages = n$2.languages;
        if (languages) {
            result.push(languages.split(','));
        }
    }
    return result;
}

function getColorDepth() {
    return window.screen.colorDepth;
}

function getDeviceMemory() {
    // `navigator.deviceMemory` is a string containing a number in some unidentified cases
    return replaceNaN(toFloat(navigator.deviceMemory), undefined);
}

var w$4 = window;
function getScreenResolution() {
    // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
    // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
    var dimensions = [toInt(w$4.screen.width), toInt(w$4.screen.height)];
    dimensions.sort().reverse();
    return dimensions;
}

var w$5 = window;
function getAvailableScreenResolution() {
    if (w$5.screen.availWidth && w$5.screen.availHeight) {
        // Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
        // I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
        var dimensions = [toInt(w$5.screen.availWidth), toInt(w$5.screen.availHeight)];
        dimensions.sort().reverse();
        return dimensions;
    }
    return undefined;
}

function getHardwareConcurrency() {
    try {
        // sometimes hardware concurrency is a string
        var concurrency = toInt(navigator.hardwareConcurrency);
        return isNaN(concurrency) ? 1 : concurrency;
    }
    catch (e) {
        return 1;
    }
}

function getTimezoneOffset() {
    var currentYear = new Date().getFullYear();
    // The timezone offset may change over time due to daylight saving time (DST) shifts.
    // The non-DST timezone offset is used as the result timezone offset.
    // Since the DST season differs in the northern and the southern hemispheres,
    // both January and July timezones offsets are considered.
    return Math.max(
    // `getTimezoneOffset` returns a number as a string in some unidentified cases
    toFloat(new Date(currentYear, 0, 1).getTimezoneOffset()), toFloat(new Date(currentYear, 6, 1).getTimezoneOffset()));
}

var w$6 = window;
function getTimezone() {
    var _a;
    if ((_a = w$6.Intl) === null || _a === void 0 ? void 0 : _a.DateTimeFormat) {
        return new w$6.Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return undefined;
}

function getSessionStorage() {
    try {
        return !!window.sessionStorage;
    }
    catch (error) {
        /* SecurityError when referencing it means it exists */
        return true;
    }
}

// https://bugzilla.mozilla.org/show_bug.cgi?id=781447
function getLocalStorage() {
    try {
        return !!window.localStorage;
    }
    catch (e) {
        /* SecurityError when referencing it means it exists */
        return true;
    }
}

function getIndexedDB() {
    // IE and Edge don't allow accessing indexedDB in private mode, therefore IE and Edge will have different
    // visitor identifier in normal and private modes.
    if (isTrident() || isEdgeHTML()) {
        return undefined;
    }
    try {
        return !!window.indexedDB;
    }
    catch (e) {
        /* SecurityError when referencing it means it exists */
        return true;
    }
}

function getOpenDatabase() {
    return !!window.openDatabase;
}

function getCpuClass() {
    return navigator.cpuClass;
}

/**
 * It should be improved to handle mock value on iOS:
 * https://github.com/fingerprintjs/fingerprintjs/issues/514#issuecomment-727782842
 */
function getPlatform() {
    return navigator.platform;
}

function getPluginsSupport() {
    return navigator.plugins !== undefined;
}

function getProductSub() {
    return navigator.productSub;
}

function getEmptyEvalLength() {
    return eval.toString().length;
}

function getErrorFF() {
    try {
        throw 'a';
    }
    catch (e) {
        try {
            e.toSource();
            return true;
        }
        catch (e2) {
            return false;
        }
    }
}

function getVendor() {
    return navigator.vendor;
}

function getChrome() {
    return window.chrome !== undefined;
}

var d$3 = document;
/**
 * navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
 * cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past with
 * site-specific exceptions. Don't rely on it.
 *
 * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js Taken from here
 */
function areCookiesEnabled() {
    // Taken from here: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
    // navigator.cookieEnabled cannot detect custom or nuanced cookie blocking configurations. For example, when blocking
    // cookies via the Advanced Privacy Settings in IE9, it always returns true. And there have been issues in the past
    // with site-specific exceptions. Don't rely on it.
    // try..catch because some in situations `document.cookie` is exposed but throws a
    // SecurityError if you try to access it; e.g. documents created from data URIs
    // or in sandboxed iframes (depending on flags/context)
    try {
        // Create cookie
        d$3.cookie = 'cookietest=1; SameSite=Strict;';
        var result = d$3.cookie.indexOf('cookietest=') !== -1;
        // Delete cookie
        d$3.cookie = 'cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT';
        return result;
    }
    catch (e) {
        return false;
    }
}

/**
 * The list of entropy sources used to make visitor identifiers.
 *
 * This value isn't restricted by Semantic Versioning, i.e. it may be changed without bumping minor or major version of
 * this package.
 */
var sources = {
    // Expected errors and default values must be handled inside the functions. Unexpected errors must be thrown.
    osCpu: getOsCpu,
    languages: getLanguages,
    colorDepth: getColorDepth,
    deviceMemory: getDeviceMemory,
    screenResolution: getScreenResolution,
    availableScreenResolution: getAvailableScreenResolution,
    hardwareConcurrency: getHardwareConcurrency,
    timezoneOffset: getTimezoneOffset,
    timezone: getTimezone,
    sessionStorage: getSessionStorage,
    localStorage: getLocalStorage,
    indexedDB: getIndexedDB,
    openDatabase: getOpenDatabase,
    cpuClass: getCpuClass,
    platform: getPlatform,
    plugins: getPlugins,
    canvas: getCanvasFingerprint,
    // adBlock: isAdblockUsed, // https://github.com/fingerprintjs/fingerprintjs/issues/405
    touchSupport: getTouchSupport,
    fonts: getFonts,
    audio: getAudioFingerprint,
    pluginsSupport: getPluginsSupport,
    productSub: getProductSub,
    emptyEvalLength: getEmptyEvalLength,
    errorFF: getErrorFF,
    vendor: getVendor,
    chrome: getChrome,
    cookiesEnabled: areCookiesEnabled,
};
/**
 * Gets a components list from the given list of entropy sources.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function getComponents(sources, sourceOptions, excludeSources) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
        var timestamp, components, _i, _a, sourceKey, result, error_1, nextTimestamp;
        var _b;
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_c) {
            switch (_c.label) {
                case 0:
                    timestamp = Date.now();
                    components = {};
                    _i = 0, _a = Object.keys(sources);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    sourceKey = _a[_i];
                    if (!excludes(excludeSources, sourceKey)) {
                        return [3 /*break*/, 6];
                    }
                    result = void 0;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    _b = {};
                    return [4 /*yield*/, sources[sourceKey](sourceOptions)];
                case 3:
                    result = (_b.value = _c.sent(), _b);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    result = error_1 && typeof error_1 === 'object' && 'message' in error_1 ? { error: error_1 } : { error: { message: error_1 } };
                    return [3 /*break*/, 5];
                case 5:
                    nextTimestamp = Date.now();
                    components[sourceKey] = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])(Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"])({}, result), { duration: nextTimestamp - timestamp }); // TypeScript has beaten me here
                    timestamp = nextTimestamp;
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, components];
            }
        });
    });
}
/**
 * Collects entropy components from the built-in sources to make the visitor identifier.
 */
function getBuiltinComponents() {
    return getComponents(sources, undefined, []);
}

function componentsToCanonicalString(components) {
    var result = '';
    for (var _i = 0, _a = Object.keys(components); _i < _a.length; _i++) {
        var componentKey = _a[_i];
        var component = components[componentKey];
        var value = component.error ? 'error' : JSON.stringify(component.value);
        result += "" + (result ? '|' : '') + componentKey.replace(/([:|\\])/g, '\\$1') + ":" + value;
    }
    return result;
}
function componentsToDebugString(components) {
    return JSON.stringify(components, function (_key, value) {
        if (value instanceof Error) {
            return errorToObject(value);
        }
        return value;
    }, 2);
}
function hashComponents(components) {
    return x64hash128(componentsToCanonicalString(components));
}
/**
 * Makes a GetResult implementation that calculates the visitor id hash on demand.
 * Designed for optimisation.
 */
function makeLazyGetResult(components) {
    var visitorIdCache;
    // A plain class isn't used because its getters and setters aren't enumerable.
    return {
        components: components,
        get visitorId() {
            if (visitorIdCache === undefined) {
                visitorIdCache = hashComponents(this.components);
            }
            return visitorIdCache;
        },
        set visitorId(visitorId) {
            visitorIdCache = visitorId;
        },
    };
}
/**
 * The class isn't exported from the index file to not expose the constructor.
 * The hiding gives more freedom for future non-breaking updates.
 */
var OpenAgent = /** @class */ (function () {
    function OpenAgent() {
    }
    /**
     * @inheritDoc
     */
    OpenAgent.prototype.get = function (options) {
        if (options === void 0) { options = {}; }
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
            var components, result;
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getBuiltinComponents()];
                    case 1:
                        components = _a.sent();
                        result = makeLazyGetResult(components);
                        if (options.debug) {
                            // console.log is ok here because it's under a debug clause
                            // eslint-disable-next-line no-console
                            console.log("Copy the text below to get the debug data:\n\n```\nversion: " + version + "\nuserAgent: " + navigator.userAgent + "\ngetOptions: " + JSON.stringify(options, undefined, 2) + "\nvisitorId: " + result.visitorId + "\ncomponents: " + componentsToDebugString(components) + "\n```");
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return OpenAgent;
}());
/**
 * Builds an instance of Agent and waits a delay required for a proper operation.
 */
function load(_a) {
    var _b = (_a === void 0 ? {} : _a).delayFallback, delayFallback = _b === void 0 ? 50 : _b;
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function () {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"])(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // A delay is required to ensure consistent entropy components.
                // See https://github.com/fingerprintjs/fingerprintjs/issues/254
                // and https://github.com/fingerprintjs/fingerprintjs/issues/307
                // and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
                // A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
                return [4 /*yield*/, requestIdleCallbackIfAvailable(delayFallback, delayFallback * 2)];
                case 1:
                    // A delay is required to ensure consistent entropy components.
                    // See https://github.com/fingerprintjs/fingerprintjs/issues/254
                    // and https://github.com/fingerprintjs/fingerprintjs/issues/307
                    // and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
                    // A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
                    _c.sent();
                    return [2 /*return*/, new OpenAgent()];
            }
        });
    });
}

// The default export is a syntax sugar (`import * as FP from '...' → import FP from '...'`).
// It should contain all the public exported values.
var index = { load: load, hashComponents: hashComponents, componentsToDebugString: componentsToDebugString };
// The exports below are for private usage. They may change unexpectedly. Use them at your own risk.
/** Not documented, out of Semantic Versioning, usage is at your own risk */
var murmurX64Hash128 = x64hash128;

/* harmony default export */ __webpack_exports__["default"] = (index);



/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var isArray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/css-loader/index.js!./client/messenger/widget/index.css":
/*!*********************************************************************!*\
  !*** ./node_modules/css-loader!./client/messenger/widget/index.css ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(undefined);
// imports


// module
exports.push([module.i, "#erxes-messenger-container {\n  position: fixed;\n  bottom: 0;\n  right: 0;\n  z-index: 2147483647;\n}\n\n#erxes-messenger-container:after {\n  content: \"\";\n  position: absolute;\n  opacity: 0;\n  width: 300px;\n  height: 242px;\n  right: -300px;\n  bottom: -242px;\n  z-index: -1;\n  background: url('https://s3.amazonaws.com/erxes/radial06.png');\n  background-position: 100% 100%;\n  background-repeat: no-repeat;\n  background-size: contain;\n  transition: all 1s ease;\n}\n\n#erxes-messenger-iframe {\n  position: absolute !important;\n  bottom: 12px;\n  right: 12px;\n  border: none;\n  max-width: none;\n  min-height: auto;\n  z-index: 2147483647;\n}\n\n.erxes-messenger-hidden>iframe {\n  width: 72px;\n  height: 72px;\n  max-width: none;\n}\n\n.erxes-messenger-hidden {\n  background: none;\n}\n\n.erxes-messenger-shown {\n  width: 421px;\n  height: 100%;\n  height: calc(100% - 20px);\n  max-height: 780px;\n}\n\n.erxes-messenger-shown:after {\n  opacity: .9 !important;\n  right: -20px !important;\n  bottom: -20px !important;\n}\n\n.erxes-messenger-shown.small {\n  max-height: 310px;\n}\n\n.erxes-messenger-shown>iframe,\n.erxes-notifier-shown>iframe {\n  width: 100% !important;\n  height: 100% !important;\n  max-width: none;\n}\n\n.erxes-notifier-shown {\n  width: 370px;\n  height: 230px;\n}\n\n.erxes-notifier-shown.fullMessage {\n  height: 550px;\n  max-height: 100%;\n}\n\n@media only screen and (max-width: 420px) {\n  #erxes-messenger-container {\n    width: 100%;\n    max-height: none;\n  }\n\n  .erxes-messenger-shown {\n    height: 100%;\n  }\n\n  #erxes-messenger-iframe {\n    bottom: 0;\n    right: 0;\n  }\n\n  body.messenger-widget-shown.widget-mobile {\n    overflow: hidden;\n    position: absolute;\n    height: 100%;\n  }\n}", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap) {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
  var base64 = new Buffer(JSON.stringify(sourceMap)).toString('base64');
  var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

  return '/*# ' + data + ' */';
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../buffer/index.js */ "./node_modules/buffer/index.js").Buffer))

/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/style-loader/addStyles.js":
/*!************************************************!*\
  !*** ./node_modules/style-loader/addStyles.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		// Test for IE <= 9 as proposed by Browserhacks
		// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
		// Tests for existence of standard globals is to allow style-loader 
		// to operate correctly into non-standard environments
		// @see https://github.com/webpack-contrib/style-loader/issues/177
		return window && document && document.all && !window.atob;
	}),
	getElement = (function(fn) {
		var memo = {};
		return function(selector) {
			if (typeof memo[selector] === "undefined") {
				memo[selector] = fn.call(this, selector);
			}
			return memo[selector]
		};
	})(function (styleTarget) {
		return document.querySelector(styleTarget)
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [],
	fixUrls = __webpack_require__(/*! ./fixUrls */ "./node_modules/style-loader/fixUrls.js");

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (typeof options.insertInto === "undefined") options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var styleTarget = getElement(options.insertInto)
	if (!styleTarget) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			styleTarget.insertBefore(styleElement, styleTarget.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			styleTarget.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			styleTarget.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		styleTarget.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	options.attrs.type = "text/css";

	attachTagAttrs(styleElement, options.attrs);
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	attachTagAttrs(linkElement, options.attrs);
	insertStyleElement(options, linkElement);
	return linkElement;
}

function attachTagAttrs(element, attrs) {
	Object.keys(attrs).forEach(function (key) {
		element.setAttribute(key, attrs[key]);
	});
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement, options);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/* If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
	and there is no publicPath defined then lets turn convertToAbsoluteUrls
	on by default.  Otherwise default to the convertToAbsoluteUrls option
	directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls){
		css = fixUrls(css);
	}

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/fixUrls.js":
/*!**********************************************!*\
  !*** ./node_modules/style-loader/fixUrls.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "./node_modules/tslib/tslib.es6.js":
/*!*****************************************!*\
  !*** ./node_modules/tslib/tslib.es6.js ***!
  \*****************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __createBinding, __exportStar, __values, __read, __spread, __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__createBinding", function() { return __createBinding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArrays", function() { return __spreadArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spreadArray", function() { return __spreadArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldGet", function() { return __classPrivateFieldGet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__classPrivateFieldSet", function() { return __classPrivateFieldSet; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

/******/ });
//# sourceMappingURL=messengerWidget.bundle.js.map