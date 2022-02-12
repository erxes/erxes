import { EmailTemplates } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

interface IListParams {
  page: number;
  perPage: number;
  searchValue: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { searchValue } = args;

  const filter: any = commonSelector;

  if (searchValue) {
    filter.$or = [
      { name: new RegExp(`.*${searchValue}.*`, 'i') },
      { content: new RegExp(`.*${searchValue}.*`, 'i') }
    ];
  }

  return filter;
};

const emailTemplateQueries = {
  /**
   * Email templates list
   */
  emailTemplates(_root, args: IListParams, { commonQuerySelector }: IContext) {
    const filter = generateFilter(commonQuerySelector, args);
    return paginate(EmailTemplates.find(filter));
  },

  /**
   * Get all email templates count. We will use it in pager
   */
  emailTemplatesTotalCount() {
    return EmailTemplates.find({}).countDocuments();
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
