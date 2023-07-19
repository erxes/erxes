export const validateDoc = params => {
  ['name', 'subdomain', 'appToken', 'start date', 'end date'].forEach(text => {
    let fieldName = text;
    if (text === 'start date') {
      fieldName = 'startDate';
    }
    if (text === 'end date') {
      fieldName = 'expireDate';
    }

    if (!params[fieldName]) {
      throw new Error(`You must provide a ${fieldName}`);
    }
  });
};
