export const connection: any = {
  setting: {},
  data: {}
};

// get local storage
const getLocalStorage = () => JSON.parse(localStorage.getItem("erxes") || "{}");

// get local storage item
export const getLocalStorageItem = (key: string) => {
  const erxesStorage = getLocalStorage();

  return erxesStorage[key];
};
