import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const webPageMutations: Record<string, Resolver> = {
  async cpWebPagesAdd(
    _parent: unknown,
    args: any,
    context: IContext,
  ): Promise<any> {
    const { models, clientPortal } = context;
    const { input } = args;

    if (!input.webId) throw new Error('webId is required');

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = input;

    return models.WebPages.createPage({
      ...restInput,
      clientPortalId: clientPortal?._id,
    });
  },

  async cpWebPagesEdit(
    _parent: unknown,
    args: any,
    { models, clientPortal }: IContext,
  ): Promise<any> {
    const { _id, input } = args;

    const { clientPortalId: _ignoredClientPortalId, ...restInput } = input;

    return models.WebPages.updatePage(_id, {
      ...restInput,
      clientPortalId: clientPortal?._id,
    });
  },

  async cpWebPagesRemove(
    _parent: unknown,
    args: any,
    { models }: IContext,
  ): Promise<any> {
    const { _id } = args;
    return models.WebPages.deleteOne({ _id });
  },
};

webPageMutations.cpWebPagesAdd.wrapperConfig = { forClientPortal: true };
webPageMutations.cpWebPagesEdit.wrapperConfig = { forClientPortal: true };
webPageMutations.cpWebPagesRemove.wrapperConfig = { forClientPortal: true };

