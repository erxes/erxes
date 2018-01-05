export const getBrowserInfo = async () => {
  const response = await fetch('https://ipinfo.io/json');
  const location = await response.json();

  return {
    remoteAddress: location.ip,
    region: location.region,
    city: location.city,
    country: location.country,
    url: location.pathname, // eslint-disable-line
    hostname: location.origin, // eslint-disable-line
    language: navigator.language, // eslint-disable-line
    userAgent: navigator.userAgent, // eslint-disable-line
  };
}
