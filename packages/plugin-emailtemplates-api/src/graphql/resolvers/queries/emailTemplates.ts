import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { sendTagsMessage } from '../../../messageBroker';

interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
  status: string;
  tag: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { searchValue, status, tag } = args;

  const filter: any = commonSelector;

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (status) {
    const elseActive = status === 'active' ? [null, undefined] : [];

    filter.status = {
      $in: [...elseActive, new RegExp(`.*${escapeRegExp(status)}.*`, 'i')]
    };
  }

  if (tag) {
    filter.tagIds = tag;
  }

  return filter;
};

const emailTemplateQueries = {
  /**
   * Email templates list
   */
  emailTemplates(
    _root,
    args: IListParams,
    { commonQuerySelector, models }: IContext
  ) {
    const filter = generateFilter(commonQuerySelector, args);

    return paginate(models.EmailTemplates.find(filter), args);
  },

  async emailTemplateCountsByTags(
    _root,
    { type },
    { models, subdomain }: IContext
  ) {
    const counts: any = {
      byTag: {}
    };

    // Count customers by tag
    const tags = await sendTagsMessage({
      subdomain,
      action: 'find',
      data: { type },
      isRPC: true,
      defaultValue: []
    });

    for await (const tag of tags) {
      counts.byTag[tag._id] = await models.EmailTemplates.count({
        tagIds: tag._id
      });
    }

    return counts;
  },

  /**
   * Get all email templates count. We will use it in pager
   */
  emailTemplatesTotalCount(_root, { searchValue }, { models }: IContext) {
    const filter: any = {};

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return models.EmailTemplates.find(filter).countDocuments();
  }
};

requireLogin(emailTemplateQueries, 'emailTemplatesTotalCount');
checkPermission(
  emailTemplateQueries,
  'emailTemplates',
  'showEmailTemplates',
  []
);

export default emailTemplateQueries;
