import {
  recordPlaceholderResolver,
  renderEmailContent,
  TEmailContentFormat,
} from 'erxes-api-shared/core-modules';
import {
  ICursorPaginateParams,
  IEmailTemplateDocument,
} from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { documentResolver } from '~/modules/documents/replacePlaceholders';

export const emailTemplateQueries = {
  async emailTemplates(
    _root: undefined,
    params: { searchValue?: string } & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const { searchValue } = params;

    const filter: FilterQuery<IEmailTemplateDocument> = {};

    if (searchValue) {
      filter.$or = [
        { name: new RegExp(`.*${searchValue}.*`, 'i') },
        { description: new RegExp(`.*${searchValue}.*`, 'i') },
      ];
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IEmailTemplateDocument>({
        model: models.EmailTemplates,
        params: {
          ...params,
          orderBy: params.orderBy || { createdAt: -1 },
        },
        query: filter,
      });

    return { list, totalCount, pageInfo };
  },

  /** What the written email turns into, whichever editor wrote it. */
  async emailContentPreview(
    _root: undefined,
    {
      replacerId,
      ...email
    }: {
      content?: string;
      contentFormat?: TEmailContentFormat;
      replacerId?: string;
    },
    { models, user }: IContext,
  ) {
    // Rehearsed on somebody real when one is picked: a field is only ever
    // wrong or thin against an actual record, never against nothing.
    const replacer = replacerId
      ? await models.Customers.findOne({ _id: replacerId }).lean()
      : undefined;

    return renderEmailContent(email, {
      resolvers: [
        documentResolver({
          models,
          replacerIds: replacerId ? [replacerId] : [],
          user,
        }),
        recordPlaceholderResolver(replacer || undefined),
      ],
      markMissing: true,
    });
  },

  async emailTemplateDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.EmailTemplates.getEmailTemplate(_id);
  },
};
