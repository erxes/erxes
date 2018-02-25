import commonListComposer from './commonListComposer';

export const removeEmptyValue = obj => {
  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof Object) removeEmptyValue(obj[key]);
    if (obj[key] === '') delete obj[key];
  });

  return obj;
};

export { commonListComposer };
