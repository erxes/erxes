import { IContext } from "~/connectionResolvers"

export const WebBuilderQueries = {

    async cpGetWebList(
        _root,
        _args,
        { models } : IContext
    ){
        return models.Web.getWebList();
    },

    async cpGetWebDetail(
        _root,
        { _id } : { _id : string},
        { models } : IContext
    ){
        return models.Web.getWebDetail( _id );
    }

}