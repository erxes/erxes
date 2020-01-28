export const connection: any = {
  setting: {},
  data: {},
  leadData: {},
  queryVariables: "$integrationId: String!, $customerId: String!",
  queryParams: "integrationId: $integrationId, customerId: $customerId"
};

// get local storage
const getLocalStorage = () => {
  const brandId = connection.setting.brand_id;

  const erxesConfig = JSON.parse(localStorage.getItem("erxes") || "{}");

  return erxesConfig[brandId] || {};
};

// get local storage item
export const getLocalStorageItem = (key: string) => {
  const erxesStorage = getLocalStorage();

  return erxesStorage[key];
};

// set local storage item
export const setLocalStorageItem = (key: string, value: string) => {
  const brandId = connection.setting.brand_id;

  const erxesStorage = JSON.parse(localStorage.getItem("erxes") || "{}");
  const brandConfig = erxesStorage[brandId] || {};

  brandConfig[key] = value;

  // replace data with brandId
  erxesStorage[brandId] = brandConfig;

  localStorage.setItem("erxes", JSON.stringify(erxesStorage));
};
