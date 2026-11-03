import {
  resolveSegmentFieldOperators,
  SEGMENT_NUMBER_OPERATORS,
  SegmentFieldMeta,
  SegmentFieldNamespace,
  SegmentRelationMeta,
} from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { listPropertySegmentFields } from './propertyFields';

/** What the segment form offers for a content type: declared fields plus the tenant's properties. */
export const listSegmentFields = async (
  models: IModels,
  contentType: string,
) => {
  const [pluginName] = contentType.split(':');
  const plugin = await getPlugin(pluginName);
  const segments = plugin.config?.meta?.segments;
  const declared: SegmentFieldMeta[] =
    segments?.segmentFields?.[contentType] || [];
  const namespaces: SegmentFieldNamespace[] =
    segments?.segmentFieldNamespaces?.[contentType] || [];

  const properties = await Promise.all(
    namespaces.map((namespace) => listPropertySegmentFields(models, namespace)),
  );

  return [...declared, ...properties.flat()].map((field) => ({
    ...field,
    operators: resolveSegmentFieldOperators(field),
  }));
};

/** Related records a segment on this content type can reach, with how each is measured. */
export const listSegmentRelations = async (subjectType: string) => {
  const relations: (SegmentRelationMeta & {
    measureOperators: ReturnType<typeof resolveSegmentFieldOperators>;
  })[] = [];

  for (const pluginName of await getPlugins()) {
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
};
