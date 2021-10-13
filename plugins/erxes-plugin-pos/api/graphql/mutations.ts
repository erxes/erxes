
const posMutations = [
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


]

export default posMutations;
