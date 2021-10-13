
const mutations = [
    /**
     * add pos
     */
    {
        name: 'posAdd',
        handler: async (_root, params, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);

            const { name, description } = params;
            return await models.Pos.posAdd(models, user, name, description)
        }
    },

    /**
     * edit pos 
     */
    {
        name: 'posEdit',
        handler: async (_root, params, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);

            return await models.Pos.posEdit(models, params)
        }
    },

    /**
     *  remove pos
     */
    {
        name: 'posRemove',
        handler: async (_root, { _id }: { _id: string }, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);

            return await models.Pos.posRemove(models, _id)
        }
    },

    {
        name: 'posConfigsUpdate',
        handler: async (_root, { posId, configsMap }, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);

            const codes = Object.keys(configsMap);

            for (const code of codes) {
                if (!code) {
                    continue;
                }

                const value = configsMap[code];
                const doc = { code, value };

                return await models.PosConfigs.createOrUpdateConfig(models, posId, doc)
            }


        }
    },


]

export default mutations;
