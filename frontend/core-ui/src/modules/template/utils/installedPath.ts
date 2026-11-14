import { TTemplate } from '@/template/types';

type TInstalled = {
  _id: string;
  partIds?: Record<string, string>;
  automationIds?: Record<string, string>;
};

/** Where to go once installed: straight to what a small template made. */
export const installedPathOf = (
  template: Pick<TTemplate, 'group'>,
  installed: TInstalled,
) => {
  const [automationId] = Object.values(installed.automationIds || {});
  const segmentIds = Object.values(installed.partIds || {});

  if (template.group === 'automation' && automationId) {
    return `/automations/edit/${automationId}`;
  }

  if (template.group === 'segment') {
    return segmentIds.length === 1
      ? `/segments/${encodeURIComponent(segmentIds[0])}`
      : '/segments';
  }

  return `/templates/installations/${installed._id}?installed=1`;
};
