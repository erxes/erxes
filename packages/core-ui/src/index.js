const { REACT_APP_PUBLIC_PATH } = window.env || {};

if (REACT_APP_PUBLIC_PATH) {
  __webpack_public_path__ = `${REACT_APP_PUBLIC_PATH}/`;
}

const REACT_APP_VERSION = localStorage.getItem("erxes_env_REACT_APP_VERSION");

if (REACT_APP_VERSION && REACT_APP_VERSION === "saas") {
  import("./bootsrapSaaS");
} else {
  import("./bootsrapOS");
}
