
const posMutations = [
    /**
     * add pos
     */
    {
        name: 'addPos',
        handler: async (_root, params, { models, checkPermission, user }) => {
            await checkPermission('addPos', user);

            const { name, description } = params;
            return await models.Pos.addPos(models, user, name, description)
        }
    },

    /**
     * edit pos 
     */
    {
        name: 'editPos',
        handler: async (_root, params, { models, checkPermission, user }) => {
            await checkPermission('editPos', user);

            // const { _id, name, description } = params;
            return await models.Pos.editPos(models, params)
        }
    },


]

export default posMutations;
