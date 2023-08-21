import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';

interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
  status: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { searchValue, status } = args;

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

    return paginate(
      models.EmailTemplates.find(filter).sort({ createdAt: -1 }),
      args
    );
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
  },

  emailTemplate(_root, { _id }, { models }: IContext) {
    return models.EmailTemplates.findOne({ _id }).lean();
  }
};

requireLogin(emailTemplateQueries, 'emailTemplatesTotalCount');
checkPermission(
  emailTemplateQueries,
  'emailTemplates',
  'showEmailTemplates',
  []
);

checkPermission(
  emailTemplateQueries,
  'emailTemplate',
  'showEmailTemplates',
  {}
);

export default emailTemplateQueries;
