import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';
import { Client, SearchOptions } from 'ldapts';
import { bindUser, consumeUser } from '../../../utilsAD';

const adMutations = {
  adConfigUpdate: async (_root, doc, { models, subdomain }: IContext) => {
    const config = await models.AdConfig.createOrUpdateConfig(doc);
    return config;
  },
  async toCheckAdUsers(_root, params, { models, subdomain, user }: IContext) {
    const config = await models.AdConfig.findOne({ code: 'ACTIVEDIRECTOR' });

    const updateUsers: any = [];
    const createUsers: any = [];
    const deleteUsers: any = [];
    let matchedCount = 0;

    if (!config?.apiUrl || !config?.adminDN || !config.adminPassword) {
      throw new Error('Active director config not found.');
    }

    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {},
      isRPC: true,
    });

    const userCodes = users.map((p) => p.username) || [];

    const client = new Client({ url: config.apiUrl });

    await bindUser(client, params.usercode, params.userpass);

    const searchBase = 'DC=light,DC=local'; // Base DN for searching
    const searchOptions: SearchOptions = {
      scope: 'sub', // Search entire subtree
      filter: `(&(objectClass=user)(!(sAMAccountName=krbtgt))(!(sAMAccountName=administrator))(!(sAMAccountName=guest)))`, // Filter for users
      attributes: ['cn', 'mail', 'samAccountName'], // Specify attributes to retrieve
    };

    const { searchEntries } = await client.search(searchBase, searchOptions);

    if (searchEntries.length === 0) {
      throw new Error('AD data not found');
    }

    const resultNames = searchEntries.map((r) => r.sAMAccountName) || [];

    const userByCode = {};
    for (const user of users) {
      userByCode[user.username] = user;

      if (!resultNames.includes(user.username)) {
        deleteUsers.push(user);
      }
    }

    for (const resultUser of searchEntries) {
      if (userCodes.includes(resultUser.sAMAccountName)) {
        const user = userByCode[resultUser.sAMAccountName.toString()];

        if (resultUser?.sAMAccountName === user.username) {
          matchedCount = matchedCount + 1;
        } else {
          updateUsers.push(resultUser);
        }
      } else {
        createUsers.push(resultUser);
      }
    }

    return {
      create: {
        count: createUsers.length,
        items: createUsers,
      },
      update: {
        count: updateUsers.length,
        items: updateUsers,
      },
      delete: {
        count: deleteUsers.length,
        items: deleteUsers,
      },
      matched: {
        count: matchedCount,
      },
    };
  },

  async toSyncAdUsers(
    _root,
    { action, users }: { action: string; users: any[] },
    { subdomain }: IContext
  ) {
    switch (action) {
      case 'CREATE': {
        for (const user of users) {
          try {
            await consumeUser(subdomain, user, 'create');
          } catch (e) {
            console.log(e, 'error');
          }
        }
        break;
      }
      case 'UPDATE': {
        for (const user of users) {
          try {
            await consumeUser(subdomain, user, 'update');
          } catch (e) {
            console.log(e, 'error');
          }
        }
        break;
      }
      case 'INACTIVE': {
        for (const user of users) {
          try {
            await consumeUser(subdomain, user, 'inActive');
          } catch (e) {
            console.log(e, 'error');
          }
        }
        break;
      }
      default:
        break;
    }

    return {
      status: 'success',
    };
  },
};

checkPermission(adMutations, 'adConfigUpdate', 'manageAD');
checkPermission(adMutations, 'toCheckAdUsers', 'manageAD');
checkPermission(adMutations, 'toSyncAdUsers', 'manageAD');

export default adMutations;
