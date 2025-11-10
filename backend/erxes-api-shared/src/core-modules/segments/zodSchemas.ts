import { z } from 'zod';
import { TSegmentProducers } from './types';

export const BaseInput = z.object({
  subdomain: z.string(),
  data: z.any().optional(),
});

const PropertyConditionExtenderInputData = z.object({
  condition: z.object({
    type: z.enum(['property', 'event', 'subSegment']),

    propertyType: z.string(),
    propertyName: z.string().optional(),
    propertyOperator: z.string().optional(),
    propertyValue: z.string().optional(),
    eventName: z.string().optional(),
    eventOccurence: z.enum(['exactly', 'atleast', 'atmost']).optional(),
    eventOccurenceValue: z.number().optional(),
    eventAttributeFilters: z.record(z.any()).array().optional(),
    subSegmentId: z.string().optional(),
    subSegmentForPreview: z.record(z.any()).optional(),
    config: z.record(z.any()).optional(),
  }),
  positiveQuery: z.record(z.any()),
});

const AssociationFilterInputData = z.object({
  mainType: z.string(),
  propertyType: z.string(),
  positiveQuery: z.record(z.any()),
  negativeQuery: z.record(z.any()).optional(),
});

const InitialSelectorInputData = z.object({
  segment: z.object({
    _id: z.string().optional(),
    contentType: z.string(),
    conditions: z.record(z.any()).array(),
    conditionsConjunction: z.enum(['and', 'or']).optional(),
    config: z.record(z.any()).optional(),
  }),
  options: z.record(z.any()),
});

const EsTypesMapInputData = z.object({
  collectionType: z.string(),
});

export const EsTypesMapInput = BaseInput.extend({
  data: EsTypesMapInputData,
});

export const InitialSelectorInput = BaseInput.extend({
  data: InitialSelectorInputData,
});

export const AssociationFilterInput = BaseInput.extend({
  data: AssociationFilterInputData,
});

export const PropertyConditionExtenderInput = BaseInput.extend({
  data: PropertyConditionExtenderInputData,
});

export type TSegmentProducersInput = {
  [TSegmentProducers.PROPERTY_CONDITION_EXTENDER]: z.infer<
    typeof PropertyConditionExtenderInputData
  >;
  [TSegmentProducers.ASSOCIATION_FILTER]: z.infer<
    typeof AssociationFilterInputData
  >;
  [TSegmentProducers.INITIAL_SELECTOR]: z.infer<
    typeof InitialSelectorInputData
  >;
  [TSegmentProducers.ES_TYPES_MAP]: z.infer<typeof EsTypesMapInputData>;
};
