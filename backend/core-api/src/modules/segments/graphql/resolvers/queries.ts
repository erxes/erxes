import {
  ISegmentContentType,
  resolveSegmentFieldOperators,
  SEGMENT_NUMBER_OPERATORS,
  SegmentFieldMeta,
  SegmentNode,
  SegmentRelationMeta,
} from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ISegmentDocument } from '../../db/definitions/segments';
import {
  countSegmentMembers,
  listSegmentMembers,
} from '../../utils/runSegment';

export const segmentQueries = {
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

  /**
   * Get one segment
   */
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
    { models, commonQuerySelector }: IContext,
  ) {
    let selector: Record<string, unknown> = {
      ...commonQuerySelector,
      contentType: { $in: contentTypes },
      // A segment saved in the old shape has no tree, and no name either -
      // nothing here can read one, and returning it breaks the non-null
      // contract on the way out. They stay in the collection until the
      // migration converts them; they just are not segments yet.
      root: { $exists: true },
    };

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (excludeIds?.length) {
      selector._id = { $nin: excludeIds };
    }

    // An explicitly requested id comes back even when it falls outside the
    // filter, so a selected segment never disappears from its own picker.
    if (ids?.length) {
      selector = { $or: [{ _id: { $in: ids } }, { ...selector }] };
    }

    return models.Segments.find(selector).sort({ name: 1 });
  },

  async segmentDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Segments.findOne({ _id, root: { $exists: true } });
  },

  /**
   * Filterable fields for a content type, as the owning plugin declares them.
   */
  async segmentFields(_root, { contentType }: { contentType: string }) {
    const [pluginName] = contentType.split(':');
    const plugin = await getPlugin(pluginName);
    const declared = plugin.config?.meta?.segments?.segmentFields || {};

    // The declaration stores operator keys; the form needs their labels and
    // what each one asks the user for, and presence is added here for
    // projected fields rather than being repeated in every plugin's list.
    return (declared[contentType] || []).map((field: SegmentFieldMeta) => ({
      ...field,
      operators: resolveSegmentFieldOperators(field),
    }));
  },

  /**
   * Relations into this content type, gathered from every plugin - the plugin
   * that owns the related records is the one that declares the traversal, so
   * the list cannot come from the subject's own service alone.
   */
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
            // A measured relation is a number, so it takes the number
            // operators - the same list the platform gives any number field.
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

  /**
   * A segment's membership and movement, day by day.
   *
   * Two sources, because they answer different halves of the question: the
   * daily rows say where membership stood, the transitions say what moved it.
   * A day with no row is left without a count rather than shown as zero - the
   * worker not having settled that day is not the same as the segment having
   * emptied.
   */
  async segmentGrowth(
    _root,
    { segmentId, days }: { segmentId: string; days?: number },
    { models }: IContext,
  ) {
    const span = Math.min(days || 30, 365);
    const since = new Date(Date.now() - span * 86_400_000);
    const from = since.toISOString().slice(0, 10);

    const [levels, movements] = await Promise.all([
      models.SegmentDailyCounts.find({
        segmentId,
        date: { $gte: from },
      }).lean(),
      models.SegmentTransitions.aggregate([
        { $match: { segmentId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              action: '$action',
            },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byDate = new Map<
      string,
      { date: string; count: number | null; joined: number; left: number }
    >();

    const at = (date: string) => {
      const day = byDate.get(date) || { date, count: null, joined: 0, left: 0 };
      byDate.set(date, day);
      return day;
    };

    for (const level of levels) {
      at(level.date).count = level.count;
    }

    for (const movement of movements) {
      const day = at(movement._id.date);

      if (movement._id.action === 'joined') {
        day.joined = movement.total;
      } else {
        day.left = movement.total;
      }
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * The segment already asking this question.
   *
   * Offered to the form before it saves, so a duplicate is answered with the
   * segment that already exists rather than with a second one.
   */
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

  /**
   * How many records an unsaved tree would match, for the segment form.
   */
  async segmentsPreviewCount(
    _root,
    { contentType, root }: { contentType: string; root: SegmentNode },
    { models, subdomain }: IContext,
  ) {
    return countSegmentMembers(models, subdomain, {
      contentType,
      root,
    } as ISegmentDocument);
  },
};
