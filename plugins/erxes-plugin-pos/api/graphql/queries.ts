
const queries = [
    /**
     * all pos list
     */
    {
        name: 'posList',
        handler: async (_root, _params, { models, checkPermission, user }) => {
            await checkPermission('showPos', user);
            return await models.Pos.getPosList(models)
        }
    },
    {
        name: 'posDetail',
        handler: async (_root, { _id }, { models, checkPermission, user }) => {
            await checkPermission('showPos', user);
            return await models.Pos.getPos(models, { _id })
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
