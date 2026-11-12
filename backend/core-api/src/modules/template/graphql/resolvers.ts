import {
  findAvailableTemplate,
  getAvailableTemplates,
  getTemplateNodeDetails,
} from '@/template/registry';
import { TTemplateAnswers } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { convertToTemplateView } from './utils';

export const templateQueries = {
  async templates(
    _root: undefined,
    _args: undefined,
    { checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    const nodes = await getTemplateNodeDetails();

    const availableTemplates = await getAvailableTemplates();

    return availableTemplates.map((template) =>
      convertToTemplateView(template, nodes),
    );
  },

  async templateDetail(
    _root: undefined,
    { pluginName, id }: { pluginName: string; id: string },
    { checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    return convertToTemplateView(
      await findAvailableTemplate(pluginName, id),
      await getTemplateNodeDetails(),
    );
  },

  async templateInstallationDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    const installation = await models.TemplateInstallations.findOne({
      _id,
    }).lean();

    if (!installation) {
      throw new Error('Installation not found');
    }

    return installation;
  },

  async templateInstallations(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    return models.TemplateInstallations.find({}).sort({ createdAt: -1 }).lean();
  },
};

export const templateMutations = {
  async templateInstall(
    _root: undefined,
    {
      pluginName,
      id,
      answers,
    }: { pluginName: string; id: string; answers: TTemplateAnswers },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('templatesInstall');

    return models.TemplateInstallations.install({
      pluginName,
      templateId: id,
      answers: answers || {},
      userId: user._id,
    });
  },

  async templateInstallationRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('templatesInstall');

    return models.TemplateInstallations.removeInstallation(_id);
  },
};
