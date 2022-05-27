// get env config from process.env or window.env
const getEnv = (name, defaultValue) => {
  if (window.env && window.env[name]) {
    return window.env[name];
  }

  if (defaultValue.includes('REACT_APP')) {
    return;
  }

  return defaultValue;
};

window.envMaps = [
  {
    name: 'REACT_APP_DOMAIN',
    processValue: '%REACT_APP_DOMAIN%'
  },
];

for (var i = 0; i < window.envMaps.length; i++) {
  var envMap = window.envMaps[i];

  localStorage.setItem(
    `cp_env_${envMap.name}`,
    getEnv(envMap.name, envMap.processValue)
  );
}
