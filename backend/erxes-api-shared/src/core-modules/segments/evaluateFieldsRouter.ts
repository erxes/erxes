import { SegmentRelationMeta } from './relationRegistry';
import { SegmentFieldMeta } from './fieldMeta';
import { SegmentValueRequest } from './plan';
import { ISegmentContentType, SegmentEvaluateFieldsResult } from './types';

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
