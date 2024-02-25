import fetch from 'node-fetch';
export const validateDoc = (params) => {
  ['name', 'subdomain', 'appToken', 'start date', 'end date'].forEach(
    (text) => {
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
    },
  );
};

export const fetchDataFromSaas = async ({
  subdomain,
  appToken,
  query,
  variables,
  name,
}) => {
  const { data, errors } = await fetch(
    `https://${subdomain}.app.erxes.io/gateway/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'erxes-app-token': appToken,
      },
      body: JSON.stringify({
        query,
        variables: { ...variables },
      }),
    },
  ).then((res) => res.json());

  if (errors) {
    throw new Error(errors[0]?.message);
  }

  return data[name];
};

export const getCustomerDoc = (customer) => {
  let customerDoc = {};

  for (const key of Object.keys(customer)) {
    if (
      [
        'state',
        'sex',
        'emails',
        'emailValidationStatus',
        'phones',
        'phoneValidationStatus',
        'status',
        'hasAuthority',
        'doNotDisturb',
        'isSubscribed',
        'relatedIntegrationIds',
        'links',
        'deviceTokens',
        'firstName',
        'lastName',
        'middleName',
        'primaryEmail',
      ].includes(key)
    ) {
      customerDoc[key] = customer[key];
    }
  }

  return customerDoc;
};

export const getCompanyDoc = (company) => {
  let companyDoc = {};

  for (const key of Object.keys(company)) {
    if (
      [
        'primaryName',
        'avatar',
        'names',
        'industry',
        'primaryEmail',
        'emails',
        'primaryAddress',
        'addresses',
        'primaryPhone',
        'phones',
        'businessType',
        'description',
        'code',
      ].includes(key)
    ) {
      companyDoc[key] = company[key];
    }
  }

  return companyDoc;
};
