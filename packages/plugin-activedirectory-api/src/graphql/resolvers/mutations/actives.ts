import { IContext } from '../../../connectionResolver';
import * as ldap from 'ldapjs';
import { getConfig } from '../../../utils';

const adMutations = {
  async activeAdd(_root, doc, { user, subdomain, models }: IContext) {
    const mainConfig = await getConfig(subdomain, 'ACTIVEDIRECTOR', {});
    if (
      !mainConfig ||
      !mainConfig.apiUrl ||
      !mainConfig.adminDN ||
      !mainConfig.adminPassword ||
      !mainConfig.baseDN
    ) {
      return;
    }

    const client = ldap.createClient({
      url: 'ldap://your-ad-server.com', // Replace with your AD server URL
    });

    console.log(client, 'client');

    client.bind('username@domain.com', 'password', (err) => {
      if (err) {
        console.error('Error connecting to AD:', err);
      } else {
        console.log('Connected to Active Directory');
      }
    });

    // const ad = await models.ActiveDirectory.createAD(doc, user);

    return 'ad';
  },
};

export default adMutations;
