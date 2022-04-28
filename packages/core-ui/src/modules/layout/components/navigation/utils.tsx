export const getLink = (url) => {
  const storageValue = window.localStorage.getItem("pagination:perPage");

  let parsedStorageValue;

  try {
    parsedStorageValue = JSON.parse(storageValue || "");
  } catch {
    parsedStorageValue = {};
  }

  if (url.includes("?")) {
    const pathname = url.split("?")[0];

    if (!url.includes("perPage") && parsedStorageValue[pathname]) {
      return `${url}&perPage=${parsedStorageValue[pathname]}`;
    }
    return url;
  }

  if (parsedStorageValue[url]) {
    return `${url}?perPage=${parsedStorageValue[url]}`;
  }

  return url;
};
