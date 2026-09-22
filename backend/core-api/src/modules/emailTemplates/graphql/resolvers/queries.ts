import {
  JSONContent,
  renderEmailContent,
  TEmailContentFormat,
} from 'erxes-api-shared/core-modules';
import { IEmailTemplateDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const emailTemplateQueries = {
  async emailTemplates(
    _root: undefined,
    params: {
      page?: number;
      perPage?: number;
      searchValue?: string;
      sortField?: string;
      sortDirection?: number;
    },
    { models }: IContext,
  ) {
    const { searchValue, sortField = 'createdAt', sortDirection = -1 } = params;

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
          orderBy: { [sortField]: sortDirection as SortOrder },
        },
        query: filter,
      });

    return { list, totalCount, pageInfo };
  },

  /** What the written email turns into, whichever editor wrote it. */
  async emailContentPreview(
    _root: undefined,
    {
      payloads,
      ...email
    }: {
      content?: string;
      contentJson?: JSONContent;
      contentFormat?: TEmailContentFormat;
      previewText?: string;
      payloads?: Record<string, any>;
    },
  ) {
    return renderEmailContent(email, { payloads });
  },

  async emailTemplateDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.EmailTemplates.getEmailTemplate(_id);
  },
};
