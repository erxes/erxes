import { IContext } from "~/connectionResolvers";
import { IWeb } from "../../@types/web";

export const WebBuilderMutations  = {

    async cpCreateWeb(
       _root,
       { doc }: { doc: IWeb },
       { models }: IContext
    ){
        const web = await models.Web.createWeb(
            doc
        );

        return web;
    },

    async cpEditWeb(
        _root,
        { _id, doc } : { _id: string; doc: IWeb },
        { models } : IContext
    ){
        const updated = await models.Web.updateWeb(
            _id,
            doc
        );
        return updated;
    },
    
    async cpRemoveWeb(
        _root,
        { _id } : { _id : string },
        { models } : IContext
    ){
        const removed = await models.Web.removeWeb(_id)

        return removed;
    }
}