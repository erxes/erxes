import { Client, SearchOptions } from 'ldapts';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export const bindUser = async (
  client: any,
  mailOrAdminDN: string,
  password: string
) => {
  try {
    await client.bind(mailOrAdminDN, password);
    console.log('Connected to Active Directory');

    return true;
  } catch (err) {
    console.log(`Error connect AD: ${err}`);

    return false;
  }
};

export const adSync = async (subdomain, params) => {
  const models = await generateModels(subdomain);
  const config = await models.AdConfig.findOne({ code: 'ACTIVEDIRECTOR' });

  if (!config?.apiUrl) {
    return { status: true, error: 'First login for AD' };
  }

  const client = new Client({ url: config.apiUrl });

  await bindUser(client, config.adminDN, config.adminPassword);

  const searchBase = String(config.baseDN); // Base DN for searching
  const searchOptions: SearchOptions = {
    scope: 'sub', // Search entire subtree
    filter: `(mail=${params.email})`, // Filter for users
    attributes: ['userPrincipalName', 'distinguishedName'], // Specify attributes to retrieve
  };

  try {
    const { searchEntries } = await client.search(searchBase, searchOptions);

    console.log(searchEntries, 'searchEntries');

    if (searchEntries.length === 0) {
      console.error('User not found');
      return { success: false, error: 'User not found' };
    }

    const userPrincipal = searchEntries[0].userPrincipalName as string;
    console.log(`Found User Principal: ${userPrincipal}`);

    if (userPrincipal) {
      const loginIdentifier = userPrincipal;

      await client.bind(loginIdentifier, params.password);

      console.log('User authenticated successfully');
      return { status: true, error: 'successful find user' }; // Return true if match is found
    } else {
      return { status: false, error: 'Error during search user on AD' }; // Return false if no match is found
    }
  } catch (err) {
    return { status: false, error: `Error during search: ${err}` };
  }
};

export const consumeUser = async (subdomain, doc, action) => {
  const user = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: { username: doc?.sAMAccountName || doc?.username },
    isRPC: true,
  });

  if (action === 'update' || action === 'create') {
    const document: any = {
      isActive: true,
      email: doc?.mail.length === 0 ? undefined : doc?.mail,
      username: doc.sAMAccountName,
      details: { firstName: doc.givenName, lastName: doc.sn },
      notUsePassword: true,
    };

    if (user) {
      await sendCoreMessage({
        subdomain,
        action: 'users.updateOne',
        data: {
          selector: {
            _id: user._id,
          },
          modifier: {
            $set: { ...document },
          },
        },
        isRPC: true,
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: 'users.create',
        data: {
          ...document,
        },
        isRPC: true,
      });
    }
  } else if (action === 'inactive' && user) {
    await sendCoreMessage({
      subdomain,
      action: 'users.setActiveStatus',
      data: { _id: user._id },
      isRPC: true,
    });
  }
};
