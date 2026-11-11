import { TTemplateAnswers } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { buildJourneyPreview } from '@/template/preview';
import {
  findAvailableTemplate,
  getAvailableTemplates,
  getTemplateNodeDetails,
  TRegisteredTemplate,
  TTemplateNodeDetails,
} from '@/template/registry';

// The flow itself stays on the server; a viewer sees what each journey is
const toTemplateView = (
  template: TRegisteredTemplate,
  nodes: Map<string, TTemplateNodeDetails>,
) => ({
  id: template.id,
  pluginName: template.pluginName,
  version: template.version,
  name: template.name,
  description: template.description,
  icon: template.icon,
  requirements: template.requirements,
  parts: template.parts.map(({ key, type }) => ({ key, type })),
  journeys: template.journeys.map((journey) => ({
    key: journey.key,
    name: journey.name,
    description: journey.description,
    triggerType: journey.trigger.type,
    stepCount: journey.flow.length,
    preview: buildJourneyPreview(journey, nodes),
  })),
});

export const templateQueries = {
  async templates(
    _root: undefined,
    _args: undefined,
    { checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    const nodes = await getTemplateNodeDetails();

    return (await getAvailableTemplates()).map((template) =>
      toTemplateView(template, nodes),
    );
  },

  async templateDetail(
    _root: undefined,
    { pluginName, id }: { pluginName: string; id: string },
    { checkPermission }: IContext,
  ) {
    await checkPermission('templatesRead');

    return toTemplateView(
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

export const TemplateInstallation = {
  // What became of each journey: its automation's name and status as now
  async automations(
    installation: { automationIds?: Record<string, string> },
    _args: undefined,
    { models }: IContext,
  ) {
    const entries = Object.entries(installation.automationIds || {});
    const automations = await models.Automations.find(
      { _id: { $in: entries.map(([, id]) => id) } },
      { name: 1, status: 1 },
    ).lean();
    const byId = new Map(
      automations.map((automation) => [String(automation._id), automation]),
    );

    return entries.flatMap(([journey, id]) => {
      const automation = byId.get(String(id));

      return automation
        ? [
            {
              _id: String(id),
              journey,
              name: automation.name,
              status: automation.status,
            },
          ]
        : [];
    });
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
