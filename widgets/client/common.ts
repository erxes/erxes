// get local storage
const getLocalStorage = () => JSON.parse(localStorage.getItem("erxes") || "{}");

// get local storage item
export const getLocalStorageItem = (key: string) => {
  const erxesStorage = getLocalStorage();

  return erxesStorage[key];
};

// set local storage item
export const setLocalStorageItem = (key: string, value: string) => {
  const erxesStorage = getLocalStorage();

  erxesStorage[key] = value;

  localStorage.setItem("erxes", JSON.stringify(erxesStorage));
};
