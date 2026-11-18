import { IContext } from '~/connectionResolvers';

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
