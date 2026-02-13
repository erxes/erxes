import { IContext } from "~/connectionResolvers"
import { BaseQueryResolver } from "~/modules/cms/utils/base-resolvers";
import { Resolver } from 'erxes-api-shared/core-types';

export const webQueries: Record<string, Resolver> = {

    async cpGetWebList(
        _root,
        _args,
        { models } : IContext
    ){
        return models.Web.getWebList();
    },

    async cpGetWebDetail(
        _root,
        args:any,
        { models } : IContext
    ){
        const { _id } = args;
        return models.Web.getWebDetail( _id );
    }
}

webQueries.cpGetWebList.wrapperConfig = {
    forClientPortal: true,
};

webQueries.cpGetWebDetail.wrapperConfig = {
    forClientPortal: true,
};

