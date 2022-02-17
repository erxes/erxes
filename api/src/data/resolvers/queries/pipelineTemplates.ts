import { PipelineTemplates } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { checkPermission } from '../boardUtils';
import { escapeRegExp } from '../../utils';

interface IListParams {
  type: string;
  searchValue: string;
  status: string;
}

const generateFilter = (commonSelector, args: IListParams) => {
  const { searchValue, type, status } = args;

  const filter: any = commonSelector;

  if (type) {
    filter.type = type;
  }

  if (searchValue) {
    filter.$or = [
      { name: new RegExp(`.*${searchValue}.*`, 'i') },
      { description: new RegExp(`.*${searchValue}.*`, 'i') }
    ];
  }

  if (status) {
    const elseActive = status === 'active' ? [null, undefined] : [];

    filter.status = {
      $in: [...elseActive, new RegExp(`.*${escapeRegExp(status)}.*`, 'i')]
    };
  }

  return filter;
};

const pipelineTemplateQueries = {
  /**
   *  Pipeline template list
   */
  async pipelineTemplates(
    _root,
    args: IListParams,
    { commonQuerySelector, user }: IContext
  ) {
    await checkPermission(args.type, user, 'showTemplates');

    const filter = generateFilter(commonQuerySelector, args);

    return PipelineTemplates.find(filter);
  },

  /**
   *  Pipeline template detail
   */
  async pipelineTemplateDetail(
    _root,
    { _id }: { _id: string },
    { user }: IContext
  ) {
    const pipelineTemplate = await PipelineTemplates.getPipelineTemplate(_id);

    await checkPermission(pipelineTemplate.type, user, 'showTemplates');

    return PipelineTemplates.findOne({ _id });
  },

  /**
   *  Pipeline template total count
   */
  pipelineTemplatesTotalCount() {
    return PipelineTemplates.find().countDocuments();
  }
};

moduleRequireLogin(pipelineTemplateQueries);

export default pipelineTemplateQueries;
