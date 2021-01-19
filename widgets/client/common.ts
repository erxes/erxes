type IStorage = { [key: string]: any }

let storage: IStorage = {};

export const initStorage = (storageObject: string) => {
  storage = JSON.parse(storageObject || '{}');
}

// get local storage item
export const getLocalStorageItem = (key: string): any => {
  return storage[key];
};

// set local storage item
export const setLocalStorageItem = (key: string, value: string, setting?: any) => {
  storage[key] = value;

  window.parent.postMessage(
    {
      fromErxes: true,
      message: 'setLocalStorageItem',
      key,
      value,
      setting
    },
    '*'
  );
};