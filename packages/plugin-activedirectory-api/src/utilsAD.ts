import { Client, SearchOptions } from 'ldapts';
import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export const bindUser = async (
  client: any,
  mailOrAdminDN: string,
  password: string,
  userDn?: string
) => {
  const updateDN = userDn ? `CN=${mailOrAdminDN},${userDn}` : mailOrAdminDN;

  try {
    await client.bind(updateDN, password);
    console.log('Connected to Active Directory');

    return true;
  } catch (err) {
    return { status: false, error: `Error connect AD: ${err}` };
  }
};

export const adSync = async (subdomain, params) => {
  const models = await generateModels(subdomain);
  const configs = await models.AdConfig.findOne({ code: 'ACTIVEDIRECTOR' });

  if (!configs?.apiUrl) {
    return { status: true, error: 'First login for AD' };
  }

  const client = new Client({ url: configs.apiUrl });

  if (!configs.isLocalUser) {
    const getBind = await bindUser(
      client,
      params.email,
      params.password,
      configs.userDN
    );

    if (getBind) {
      return { status: true, error: 'successful bind user' };
    }
  }

  if (configs.isLocalUser) {
    await bindUser(client, configs.adminDN, configs.adminPassword);

    const searchBase = 'DC=light,DC=local'; // Base DN for searching
    const searchOptions: SearchOptions = {
      scope: 'sub', // Search entire subtree
      filter: `(&(objectClass=user)(mail=${params.email}))`, // Filter for users
      attributes: ['cn', 'sn', 'mail', 'samAccountName'], // Specify attributes to retrieve
    };

    try {
      const { searchEntries } = await client.search(searchBase, searchOptions);

      const found = (searchEntries || []).find(
        (data) => data.mail === params.email
      );

      if (found) {
        return { status: true, error: 'successful find user' }; // Return true if match is found
      } else {
        return { status: false, error: 'Error during search user on AD' }; // Return false if no match is found
      }
    } catch (err) {
      return { status: false, error: `Error during search: ${err}` };
    }
  }
};

export const consumeUser = async (subdomain, doc, action) => {
  const user = await sendCoreMessage({
    subdomain,
    action: 'users.findOne',
    data: { _id: doc._id },
    isRPC: true,
    defaultValue: {},
  });

  if (action === 'update' || action === 'create') {
    const document: any = {
      isActive: true,
      email: doc.mail,
      username: doc.sAMAccountName,
      // password: doc.password,
    };

    if (user) {
      await sendCoreMessage({
        subdomain,
        action: 'users.updateOne',
        data: { _id: user._id, doc: { ...document } },
        isRPC: true,
      });
    } else {
      await sendCoreMessage({
        subdomain,
        action: 'users.create',
        data: { doc: { ...document } },
        isRPC: true,
      });
    }
  } else if (action === 'delete' && user) {
    await sendCoreMessage({
      subdomain,
      action: 'products.removeProducts',
      data: { _ids: [user._id] },
      isRPC: true,
    });
  }
};
