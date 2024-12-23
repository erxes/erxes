import { Client, SearchOptions } from 'ldapts';
import { getConfig } from './utils';

const decodeDN = (dn: string) => {
  const decoded = dn.replace(/\(([0-9A-Fa-f]{2})\)/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });

  return Buffer.from(decoded, 'binary').toString('utf8');
};

export const adSync = async (subdomain, params) => {
  const configs = await getConfig(subdomain, 'ACTIVEDIRECTOR', {});
  if (!configs || !Object.keys(configs).length) {
    return { status: true, error: 'First login for AD' };
  }

  const client = new Client({ url: configs.apiUrl });

  try {
    await client.bind(configs.adminDN, configs.adminPassword);
    console.log('Connected to Active Directory');
  } catch (err) {
    return { status: false, error: `Error connect AD: ${err}` };
  }

  const searchBase = 'DC=light,DC=local'; // Base DN for searching
  const searchOptions: SearchOptions = {
    scope: 'sub', // Search entire subtree
    filter: `(&(objectClass=user)(mail=${params}))`, // Filter for users
    attributes: ['cn', 'sn', 'mail', 'samAccountName'], // Specify attributes to retrieve
  };

  try {
    const { searchEntries } = await client.search(searchBase, searchOptions);

    const found = (searchEntries || []).find((data) => data.mail === params);

    if (found) {
      return { status: true, error: 'successful find user' }; // Return true if match is found
    } else {
      return { status: false, error: 'Error during search user on AD' }; // Return false if no match is found
    }
  } catch (err) {
    return { status: false, error: `Error during search: ${err}` };
  }
};
