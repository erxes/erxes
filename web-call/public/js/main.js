// get env config from process.env or window.env
const getEnv = (name,defaultValue) => {
  if (window.env && window.env[name]) {
    return window.env[name]
  }

  return defaultValue
}


