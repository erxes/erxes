import { Client, SearchOptions } from 'ldapts';
import { generateModels } from './connectionResolver';

const decodeDN = (dn: string) => {
  const decoded = dn.replace(/\(([0-9A-Fa-f]{2})\)/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });

  return Buffer.from(decoded, 'binary').toString('utf8');
};

const bindUser = async (client: any, dn, pass) => {
  console.log(pass, 'pass');
  try {
    await client.bind(dn, pass);

    console.log('Connected to Active Directory');
  } catch (err) {
    return { status: false, error: `Error connect AD: ${err}` };
  }
};

export const adSync = async (subdomain, data) => {
  const models = await generateModels(subdomain);
  const configs = await models.AdConfig.findOne({ code: 'ACTIVEDIRECTOR' });

  if (!configs?.apiUrl) {
    return { status: true, error: 'First login for AD' };
  }

  const client = new Client({ url: configs.apiUrl });

  if (configs.isLocalUser) {
    await bindUser(client, data.userDN, data.password);
  }

  if (!configs.isLocalUser) {
    await bindUser(client, configs.adminDN, configs.adminPassword);
  }

  // try {
  //   await client.bind(configs.adminDN, configs.adminPassword);
  //   console.log('Connected to Active Directory');
  // } catch (err) {
  //   return { status: false, error: `Error connect AD: ${err}` };
  // }

  const searchBase = 'DC=light,DC=local'; // Base DN for searching
  const searchOptions: SearchOptions = {
    scope: 'sub', // Search entire subtree
    filter: `(&(objectClass=user)(mail=${data.email}))`, // Filter for users
    attributes: ['cn', 'sn', 'mail', 'samAccountName'], // Specify attributes to retrieve
  };

  try {
    const { searchEntries } = await client.search(searchBase, searchOptions);

    const found = (searchEntries || []).find(
      (data) => data.mail === data.email
    );

    if (found) {
      return { status: true, error: 'successful find user' }; // Return true if match is found
    } else {
      return { status: false, error: 'Error during search user on AD' }; // Return false if no match is found
    }
  } catch (err) {
    return { status: false, error: `Error during search: ${err}` };
  }
};
