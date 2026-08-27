import { SegmentFieldMeta, SegmentRelationMeta } from './fieldMeta';
import { SegmentValueRequest } from './plan';
import { ISegmentContentType, SegmentEvaluateFieldsResult } from './types';

/**
 * The module that declared a content type.
 *
 * The other segment producers carry a `contentType` naming the records they are
 * about, and it is the module's own `contentTypes` list that says who owns it.
 * Deriving the module name from the string instead - splitting `sales:deal`
 * into `sales` and `deal` - looks for a module named after the entity, which no
 * plugin has.
 */
export const segmentModuleForContentType = <
  TModule extends { contentTypes?: ISegmentContentType[] },
>(
  modules: Record<string, TModule>,
  contentType: string,
): TModule | undefined =>
  Object.values(modules).find((module) =>
    (module.contentTypes || []).some(
      (declared) => declared.contentType === contentType,
    ),
  );

/**
 * Routes one `evaluateFields` batch to the modules that declared its refs.
 *
 * The other segment producers can be routed by the content type in their
 * input, but this one cannot: a relation is measured from the subject that
 * owns it, so the batch deliberately arrives with a subject type the answering
 * plugin does not own - a customer's deals are counted by sales. Routing on
 * the subject type would send that batch to a module named `customer` that no
 * plugin has.
 *
 * So the routing follows the requests instead. Each ref goes to the module
 * that declared the field or the relation behind it, which every module
 * already publishes, and one batch may legitimately fan out to several.
 */

/** A module that declares segment values and can resolve its own. */
type SegmentEvaluableModule<TModels> = {
  segmentFields?: Record<string, SegmentFieldMeta[]>;
  segmentRelations?: SegmentRelationMeta[];
  evaluateFields: (
    data: SegmentEvaluateFieldsData,
    context: { models: TModels; subdomain: string },
  ) => Promise<SegmentEvaluateFieldsResult>;
};

type SegmentEvaluateFieldsData = {
  subjectType: string;
  subjectIds: string[];
  requests: SegmentValueRequest[];
};

export const createSegmentEvaluateFieldsHandler =
  <TModels>({
    modules,
    generateModels,
  }: {
    modules: Record<string, SegmentEvaluableModule<TModels>>;
    generateModels: (subdomain: string) => Promise<TModels>;
  }) =>
  async ({
    subdomain,
    data,
  }: {
    subdomain: string;
    data: SegmentEvaluateFieldsData;
  }): Promise<SegmentEvaluateFieldsResult> => {
    const owner = (request: SegmentValueRequest): string | undefined =>
      Object.keys(modules).find((name) =>
        request.kind === 'relation'
          ? (modules[name].segmentRelations || []).some(
              (relation) => relation.key === request.relationKey,
            )
          : Boolean(modules[name].segmentFields?.[request.contentType]),
      );

    const values: SegmentEvaluateFieldsResult['values'] = {};
    const unavailable: string[] = [];
    const byModule = new Map<string, SegmentValueRequest[]>();

    for (const request of data.requests) {
      const name = owner(request);

      // A ref no module claims is reported rather than answered as unset,
      // which would decide membership against a value nobody read.
      if (!name) {
        unavailable.push(request.ref);
        continue;
      }

      byModule.set(name, [...(byModule.get(name) || []), request]);
    }

    if (!byModule.size) {
      return { values, unavailable };
    }

    const models = await generateModels(subdomain);
    const context = { models, subdomain };

    const answers = await Promise.all(
      [...byModule].map(([name, requests]) =>
        modules[name].evaluateFields({ ...data, requests }, context),
      ),
    );

    for (const answer of answers) {
      for (const [subjectId, entries] of Object.entries(answer.values)) {
        values[subjectId] = { ...(values[subjectId] || {}), ...entries };
      }

      unavailable.push(...(answer.unavailable || []));
    }

    return unavailable.length ? { values, unavailable } : { values };
  };
