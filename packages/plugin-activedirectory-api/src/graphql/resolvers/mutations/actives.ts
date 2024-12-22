import { IContext } from '../../../connectionResolver';
import { Client, SearchOptions } from 'ldapts';
import { getConfig } from '../../../utils';

const decodeDN = (dn: string) => {
  const decoded = dn.replace(/\(([0-9A-Fa-f]{2})\)/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });

  return Buffer.from(decoded, 'binary').toString('utf8');
};

const adMutations = {
  async activeAdd(_root, doc, { user, subdomain, models }: IContext) {
    const mainConfig = await getConfig(subdomain, 'ACTIVEDIRECTOR', {});
    if (
      !mainConfig ||
      !mainConfig.apiUrl ||
      !mainConfig.adminDN ||
      !mainConfig.adminPassword
    ) {
      return;
    }

    const client = new Client({ url: mainConfig.apiUrl });

    try {
      // const ok = decodeDN(mainConfig.adminDN);
      await client.bind(mainConfig.adminDN, mainConfig.adminPassword);
      console.log('Connected to Active Directory');
    } catch (err) {
      console.error('Error connecting to Active Directory:', err);
    }

    const searchBase = 'DC=light,DC=local'; // Base DN for searching
    const searchOptions: SearchOptions = {
      scope: 'sub', // Search entire subtree
      filter: '(objectClass=person)', // Filter for users
      attributes: ['cn', 'sn', 'mail', 'samAccountName'], // Specify attributes to retrieve
    };

    try {
      const { searchEntries } = await client.search(searchBase, searchOptions);
      console.log('Search Results:', searchEntries);
    } catch (err) {
      console.error('Error during search:', err);
    }

    const ad = await models.ActiveDirectory.createAD(doc, user);

    return ad;
  },
};

export default adMutations;
