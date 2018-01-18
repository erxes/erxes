export const getBrowserInfo = async () => {
  let location;

  try {
    const response = await fetch('https://ipinfo.io/json');
    location = await response.json();
  } catch (e) {
    console.log(e.message); // eslint-disable-line
    location = {};
  }

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
