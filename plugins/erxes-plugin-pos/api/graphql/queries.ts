
const queries = [
    /**
     * all pos list
     */
    {
        name: 'allPos',
        handler: async (_root, _params, { models, checkPermission, user }) => {
            await checkPermission('showPos', user);
            return await models.Pos.getPosList(models)
        }
    },


    {
        name: 'posConfigs',
        handler: async (_root, { posId }: { posId: string }, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);
            return await models.PosConfigs.configs(models, posId)
        }
    },

    {
        name: 'productGroups',
        handler: async (_root, { posId }: { posId: string }, { models, checkPermission, user }) => {
            await checkPermission('managePos', user);
            return await models.ProductGroups.groups(models, posId)
        }
    },


]

export default queries;
