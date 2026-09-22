import {
  ISegmentContentType,
  segmentDependencyKey,
  resolveSegmentFieldOperators,
  SEGMENT_NUMBER_OPERATORS,
  SegmentFieldMeta,
  SegmentNode,
  SegmentRelationMeta,
} from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ISegmentDocument } from '../../db/definitions/segments';
import { visibleTo } from '../../utils/access';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

const PREVIEW_BUDGET_MS =
  Number(process.env.SEGMENT_PREVIEW_BUDGET_MS) || 10_000;
import {
  countSegmentMembers,
  listSegmentMembers,
} from '../../utils/runSegment';

export const segmentQueries = {
  async segmentUsage(
    _root: unknown,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    if (!ids?.length) {
      return [];
    }

    const automations = await models.Automations.find(
      {
        $or: [
          { 'triggers.config.contentId': { $in: ids } },
          { 'actions.config.contentId': { $in: ids } },
        ],
      },
      { _id: 1, name: 1, status: 1, triggers: 1, actions: 1 },
    ).lean();

    const segments = await models.Segments.find(
      { _id: { $nin: ids }, dependsOn: { $in: ids.map(segmentDependencyKey) } },
      { _id: 1, name: 1, dependsOn: 1 },
    ).lean();

    return ids.map((segmentId) => ({
      segmentId,
      automations: automations
        .filter((automation) =>
          [...automation.triggers, ...automation.actions].some(
            (node) => node.config?.contentId === segmentId,
          ),
        )
        .map(({ _id, name, status }) => ({ _id, name, status })),
      segments: segments
        .filter((segment) =>
          (segment.dependsOn || []).includes(segmentDependencyKey(segmentId)),
        )
        .map(({ _id, name }) => ({ _id, name })),
    }));
  },

  async segmentsGetTypes() {
    const pluginNames = await getPlugins();
    let types: Array<{ name: string; description: string }> = [];
    for (const serviceName of pluginNames) {
      const plugin = await getPlugin(serviceName);
      const meta = plugin.config.meta || {};
      if (meta.segments) {
        const pluginTypes = (meta.segments.contentTypes || []).flatMap(
          (ct: ISegmentContentType) => {
            if (ct.hideInSidebar) {
              return [];
            }
            return {
              contentType:
                ct.contentType || `${serviceName}:${ct.moduleName}.${ct.type}`,
              description: ct.description,
            };
          },
        );
        types = [...types, ...pluginTypes];
      }
    }
    return types;
  },

  async segments(
    _root,
    {
      contentTypes,
      ids,
      searchValue,
      excludeIds,
    }: {
      contentTypes: string[];
      ids?: string[];
      searchValue?: string;
      excludeIds?: string[];
    },
    { models, commonQuerySelector, user }: IContext,
  ) {
    let selector: Record<string, unknown> = {
      ...commonQuerySelector,
      ...visibleTo(user),
      contentType: { $in: contentTypes },
      root: { $exists: true },
      ownedBy: { $exists: false },
      name: { $exists: true, $ne: '' },
    };

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (excludeIds?.length) {
      selector._id = { $nin: excludeIds };
    }

    if (ids?.length) {
      selector = { $or: [{ _id: { $in: ids } }, { ...selector }] };
    }

    return models.Segments.find(selector).sort({ name: 1 });
  },

  async segmentDetail(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    return models.Segments.findOne({
      _id,
      root: { $exists: true },
      ...visibleTo(user),
    });
  },

  async segmentFields(_root, { contentType }: { contentType: string }) {
    const [pluginName] = contentType.split(':');
    const plugin = await getPlugin(pluginName);
    const declared = plugin.config?.meta?.segments?.segmentFields || {};

    return (declared[contentType] || []).map((field: SegmentFieldMeta) => ({
      ...field,
      operators: resolveSegmentFieldOperators(field),
    }));
  },

  async segmentRelations(_root, { subjectType }: { subjectType: string }) {
    const pluginNames = await getPlugins();
    const relations: SegmentRelationMeta[] = [];

    for (const pluginName of pluginNames) {
      const plugin = await getPlugin(pluginName);
      const declared: SegmentRelationMeta[] =
        plugin.config?.meta?.segments?.segmentRelations || [];

      relations.push(
        ...declared
          .filter((relation) => relation.subjectType === subjectType)
          .map((relation) => ({
            ...relation,
            measureOperators: resolveSegmentFieldOperators({
              key: relation.key,
              label: relation.label,
              operators: SEGMENT_NUMBER_OPERATORS,
              kind: 'projected',
              path: relation.key,
              input: 'number',
            }),
          })),
      );
    }

    return relations;
  },

  async segmentMembers(
    _root,
    {
      segmentId,
      cursor,
      limit,
    }: { segmentId: string; cursor?: string; limit?: number },
    { models, subdomain }: IContext,
  ) {
    const segment = await models.Segments.getSegment(segmentId);

    if (!segment) {
      return { ids: [] };
    }

    return listSegmentMembers(models, subdomain, segment, { cursor, limit });
  },

  async segmentMemberCount(
    _root,
    { segmentId }: { segmentId: string },
    { models, subdomain }: IContext,
  ) {
    const segment = await models.Segments.getSegment(segmentId);

    return segment
      ? countSegmentMembers(models, subdomain, segment)
      : { count: 0 };
  },

  async segmentGrowth(
    _root,
    { segmentId, days }: { segmentId: string; days?: number },
    { models }: IContext,
  ) {
    const span = Math.min(days || 30, 365);
    const now = new Date();
    const since = new Date(now.getTime() - span * DAY_MS);

    const segment = await models.Segments.findOne(
      { _id: segmentId },
      { membersCount: 1 },
    ).lean<ISegmentDocument>();

    if (!segment) {
      return [];
    }

    const [anchor, dailyRows, movements] = await Promise.all([
      models.SegmentLevelSamples.anchorFor(segmentId, now),
      models.SegmentDailyCounts.find({
        segmentId,
        date: { $gte: since.toISOString().slice(0, 10) },
      }).lean(),
      models.SegmentTransitions.find(
        { segmentId, createdAt: { $gte: since } },
        { action: 1, createdAt: 1, _id: 0 },
      ).lean(),
    ]);

    if (!anchor && !dailyRows.length) {
      return [];
    }

    const earliest = [
      ...(anchor ? [anchor.at.getTime()] : []),
      ...dailyRows.map((row) => Date.parse(row.date)),
      ...movements.map((movement) => movement.createdAt.getTime()),
    ].reduce((oldest, at) => Math.min(oldest, at), Number.POSITIVE_INFINITY);

    const start = Math.max(
      since.getTime(),
      Number.isFinite(earliest) ? earliest : since.getTime(),
    );

    const step = now.getTime() - start <= 2 * DAY_MS ? HOUR_MS : DAY_MS;

    const bucketOf = (at: number) => Math.floor(at / step) * step;
    const first = bucketOf(start);
    const last = bucketOf(now.getTime());

    const joined = new Map<number, number>();
    const left = new Map<number, number>();

    for (const movement of movements) {
      const bucket = bucketOf(movement.createdAt.getTime());
      const into = movement.action === 'joined' ? joined : left;

      into.set(bucket, (into.get(bucket) || 0) + 1);
    }

    const byDate = new Map(dailyRows.map((row) => [row.date, row.count]));

    const series: {
      at: Date;
      date: string;
      count: number | null;
      joined: number;
      left: number;
    }[] = [];

    let level = segment.membersCount ?? null;

    for (let bucket = last; bucket >= first; bucket -= step) {
      const at = new Date(bucket);
      const date = at.toISOString().slice(0, 10);
      const inJoined = joined.get(bucket) || 0;
      const inLeft = left.get(bucket) || 0;

      series.unshift({
        at,
        date,
        count: level ?? byDate.get(date) ?? null,
        joined: inJoined,
        left: inLeft,
      });

      if (level !== null) {
        level = level - inJoined + inLeft;
      }
    }

    return series;
  },

  async segmentSameDefinition(
    _root,
    {
      contentType,
      root,
      excludeId,
    }: { contentType: string; root: SegmentNode; excludeId?: string },
    { models }: IContext,
  ) {
    return models.Segments.findSameDefinition(contentType, root, excludeId);
  },

  async segmentsPreviewCount(
    _root,
    { contentType, root }: { contentType: string; root: SegmentNode },
    { models, subdomain }: IContext,
  ) {
    return countSegmentMembers(
      models,
      subdomain,
      { contentType, root } as ISegmentDocument,
      PREVIEW_BUDGET_MS,
    );
  },
};
