
const posQueries = [
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


]

export default posQueries;
