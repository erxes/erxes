const { REACT_APP_PUBLIC_PATH } = window.env || {};

console.log(REACT_APP_PUBLIC_PATH);

if (REACT_APP_PUBLIC_PATH) {
  __webpack_public_path__ = `${REACT_APP_PUBLIC_PATH}/`;
}

import("./bootstrap");
