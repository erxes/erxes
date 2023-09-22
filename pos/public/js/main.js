// get env config from process.env or window.env
const getEnv = (name, defaultValue) => {
  if (window.env && window.env[name]) {
    return window.env[name];
  }

  return defaultValue;
};

window.envMaps = [
  {
    name: 'NEXT_PUBLIC_MAIN_API_DOMAIN',
    processValue: '%NEXT_PUBLIC_MAIN_API_DOMAIN%'
  },
  {
    name: 'NEXT_PUBLIC_MAIN_SUBS_DOMAIN',
    processValue: '%NEXT_PUBLIC_MAIN_SUBS_DOMAIN%'
  },
  {
    name: 'NEXT_PUBLIC_SERVER_API_DOMAIN',
    processValue: '%NEXT_PUBLIC_SERVER_API_DOMAIN%'
  },
  {
    name: 'NEXT_PUBLIC_SERVER_DOMAIN',
    processValue: '%NEXT_PUBLIC_SERVER_DOMAIN%'
  },
];

for (var i = 0; i < window.envMaps.length; i++) {
  var envMap = window.envMaps[i];

  localStorage.setItem(
    `pos_env_${envMap.name}`,
    getEnv(envMap.name, envMap.processValue)
  );
}
