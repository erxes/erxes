import { IContext } from "~/connectionResolvers"
import { Resolver } from 'erxes-api-shared/core-types';
import { getDomains, getDeploymentEvents } from "../../utils";

export const webQueries: Record<string, Resolver> = {

    async GetWebList(
        _root,
        _args,
        { models } : IContext
    ){
        return models.Web.getWebList();
    },

    async GetWebDetail(
        _root,
        args:{_id: string},
        { models } : IContext
    ){
        const { _id } = args;
        return models.Web.getWebDetail( _id );
    },

    async cpGetWebDetail(
        _root,
        args:{_id: string},
        { models } : IContext
    ){
        const { _id } = args;
        return models.Web.getWebDetail( _id );
    },
    async cpGetDomains(
        _root,
        { projectId }: { projectId: string },
        _context: IContext
    ){
        return getDomains(projectId);
    },

    async cpGetDeploymentEvents(
        _root,
        { id }: { id: string },
        _context: IContext
    ) {
        return getDeploymentEvents(id);
    },
}

webQueries.cpGetWebDetail.wrapperConfig = {
    forClientPortal: true,
};

webQueries.cpGetDomains.wrapperConfig = {
    forClientPortal: true,
};

webQueries.cpGetDeploymentEvents.wrapperConfig = {
    forClientPortal: true,
};
