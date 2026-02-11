import { IContext } from "~/connectionResolvers";
import { IWeb } from "../../@types/web";
import { Resolver } from 'erxes-api-shared/core-types';

export const webBuilderMutations: Record<string, Resolver> = {

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
};

webBuilderMutations.cpCreateWeb.wrapperConfig = {
    forClientPortal: true,
};

webBuilderMutations.cpEditWeb.wrapperConfig = {
    forClientPortal: true,
};

webBuilderMutations.cpRemoveWeb.wrapperConfig = {
    forClientPortal: true,
};