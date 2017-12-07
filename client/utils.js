export const getBrowserInfo = () => {
  return {
    url: location.pathname, // eslint-disable-line
    hostname: location.origin, // eslint-disable-line
    language: navigator.language, // eslint-disable-line
    userAgent: navigator.userAgent, // eslint-disable-line
  };
}
