import { splitType, TSegmentProducers } from 'erxes-api-shared/core-modules';
import {
  fetchByQuery,
  generateElkIds,
  getPlugin,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { SEGMENT_DATE_OPERATORS, SEGMENT_NUMBER_OPERATORS } from '../constants';
import { ICondition, ISegment } from '../db/definitions/segments';
import { IOptions } from '../types';

const generateDefaultSelector = ({ defaultMustSelector, isInitialCall }) => {
  if (isInitialCall && defaultMustSelector) {
    return defaultMustSelector.map((s) => ({ ...s }));
  }

  return [];
};

const generatePositiveNegativeSelector = ({ cj, selector = {} as any }) => {
  let selectorPositiveList: any[] = [];
  let selectorNegativeList: any[] = [];

  if (cj === 'and') {
    selectorPositiveList = selector.must;
    selectorNegativeList = selector.must_not;
  } else {
    const selectorMustBool = selector.must[0].bool;

    selectorPositiveList = selectorMustBool.should;
    selectorNegativeList = selectorMustBool.must_not;
  }

  return { selectorPositiveList, selectorNegativeList };
};

export const generateQueryBySegment = async (
  models: IModels,
  subdomain: string,
  args: {
    segment: ISegment;
    selector: any;
    pluginConfigs: any;
    options?: IOptions;
    isInitialCall?: boolean;
  },
) => {
  const { segment, pluginConfigs, options = {}, isInitialCall } = args;

  let { selector } = args;

  const { contentType } = segment;
  const [pluginName, collectionType] = splitType(contentType);
  const { defaultMustSelector } = options;

  // generated default selector of service
  const defaultSelector = generateDefaultSelector({
    defaultMustSelector,
    isInitialCall,
  });

  const cj = segment.conditionsConjunction || 'and';

  if (cj === 'and') {
    selector.must = defaultSelector;
    selector.must_not = [];
  } else {
    selector.must = [
      {
        bool: {
          should: [],
          must_not: [],
        },
      },
      ...defaultSelector,
    ];
  }

  // generate positive and negative selector list based on conjunction of segment

  const { selectorPositiveList, selectorNegativeList } =
    generatePositiveNegativeSelector({ cj, selector });

  const parentSegment = await models.Segments.findOne({ _id: segment.subOf });

  //extend query of parent segment query
  if (parentSegment && (!segment._id || segment._id !== parentSegment._id)) {
    selector.must.push({ bool: {} });

    await generateQueryBySegment(models, subdomain, {
      ...args,
      selector: selector.must[selector.must.length - 1].bool,
      segment: parentSegment,
      isInitialCall: false,
    });
  }

  let typesMap = {};

  const eventPositive: any = [];
  const eventNegative: any = [];
  const propertiesPositive: any = [];
  const propertiesNegative: any = [];

  for (const pluginConfig of pluginConfigs) {
    const { contentTypes, esTypesMapAvailable, initialSelectorAvailable } =
      pluginConfig;

    if (contentTypes) {
      for (const ct of contentTypes) {
        if (ct.type !== collectionType) {
          continue;
        }
        if (esTypesMapAvailable) {
          const response = await sendCoreModuleProducer({
            module: 'segments',
            pluginName,
            producerName: TSegmentProducers.ES_TYPES_MAP,
            input: {
              collectionType,
            },
          });

          typesMap = response.typesMap;
        }

        if (initialSelectorAvailable) {
          const { negative, positive } = await sendCoreModuleProducer({
            module: 'segments',
            pluginName,
            producerName: TSegmentProducers.INITIAL_SELECTOR,
            input: {
              segment,
              options,
            },
          });

          if (negative) {
            propertiesNegative.push(negative);
          }

          if (positive) {
            propertiesPositive.push(positive);
          }
        }
      }
    }
  }

  const propertyConditions: ICondition[] = [];
  const eventConditions: ICondition[] = [];

  const conditions = segment.conditions || [];

  for (const condition of conditions) {
    if (condition.type === 'property') {
      if (condition.propertyType === 'core:form_submission') {
        const formFieldCondition = {
          ...condition,
          propertyName: 'formFieldId',
          propertyValue: condition.propertyName,
        };

        if (
          condition.propertyOperator &&
          ['is', 'ins'].indexOf(condition.propertyOperator) <= 0
        ) {
          formFieldCondition.propertyOperator = 'e';
          condition.propertyName = 'value';
          propertyConditions.push(condition);
        }

        propertyConditions.push(formFieldCondition);
        continue;
      }

      propertyConditions.push(condition);
    }

    if (condition.type === 'event') {
      eventConditions.push(condition);
    }

    if (
      condition.type === 'subSegment' &&
      (condition.subSegmentId || condition.subSegmentForPreview)
    ) {
      let subSegment = condition.subSegmentForPreview;

      if (condition.subSegmentId) {
        subSegment = await models.Segments.getSegment(condition.subSegmentId);
      }

      selectorPositiveList.push({ bool: {} });

      await generateQueryBySegment(models, subdomain, {
        ...args,
        segment: subSegment || ({} as ISegment),
        selector: selectorPositiveList[selectorPositiveList.length - 1].bool,
        isInitialCall: false,
      });
    }
  }

  for (const condition of propertyConditions) {
    const field = condition.propertyName;

    if (field && condition.propertyType) {
      let [positiveQuery, negativeQuery] = elkConvertConditionToQuery({
        field,
        type: typesMap[field],
        operator: condition.propertyOperator || '',
        value: condition.propertyValue || '',
      });

      for (const serviceConfig of pluginConfigs) {
        const { contentTypes, propertyConditionExtenderAvailable } =
          serviceConfig;

        const [propertyPluginName, propertyContentType] = splitType(
          condition.propertyType,
        );

        //pass positive query to service for get extend positive query if service has property condition extender
        if (contentTypes && propertyConditionExtenderAvailable) {
          for (const ct of contentTypes) {
            if (ct.type !== propertyContentType) {
              continue;
            }
            const { positive, ignoreThisPostiveQuery } =
              await sendCoreModuleProducer({
                module: 'segments',
                pluginName: propertyPluginName,
                producerName: TSegmentProducers.PROPERTY_CONDITION_EXTENDER,
                input: { condition, positiveQuery },
                defaultValue: { positive: null, ignoreThisPostiveQuery: false },
              });

            if (positive) {
              positiveQuery = {
                bool: {
                  must: ignoreThisPostiveQuery
                    ? [positive]
                    : [positiveQuery, positive],
                },
              };
            }
          }
        }
      }

      // push positive negative query if property type is equal
      if (contentType === condition.propertyType) {
        if (positiveQuery) {
          propertiesPositive.push(positiveQuery);
        }

        if (negativeQuery) {
          propertiesNegative.push(negativeQuery);
        }
      } else {
        // send message to get ids of contents generated by service
        const ids = await associationPropertyFilter(subdomain, {
          pluginName,
          mainType: contentType,
          propertyType: condition.propertyType,
          positiveQuery,
          negativeQuery,
        });

        propertiesPositive.push({
          terms: {
            _id: await generateElkIds(
              ids.filter((id) => id),
              subdomain,
            ),
          },
        });
      }
    }
  }

  for (const condition of eventConditions) {
    const {
      eventOccurrence,
      eventName,
      eventOccurenceValue,
      eventAttributeFilters = [],
    } = condition;

    eventPositive.push({
      term: {
        name: eventName,
      },
    });

    if (eventOccurrence === 'exactly') {
      eventPositive.push({
        term: {
          count: eventOccurenceValue,
        },
      });
    }

    if (eventOccurrence === 'atleast') {
      eventPositive.push({
        range: {
          count: {
            gte: eventOccurenceValue,
          },
        },
      });
    }

    if (eventOccurrence === 'atmost') {
      eventPositive.push({
        range: {
          count: {
            lte: eventOccurenceValue,
          },
        },
      });
    }

    for (const filter of eventAttributeFilters) {
      const [positiveQuery, negativeQuery] = elkConvertConditionToQuery({
        field: `attributes.${filter.name}`,
        operator: filter.operator,
        value: filter.value,
      });

      if (positiveQuery) {
        eventPositive.push(positiveQuery);
      }

      if (negativeQuery) {
        eventNegative.push(negativeQuery);
      }
    }

    if (eventPositive.length > 0 || eventNegative.length > 0) {
      const idsByEvents = await fetchByQuery({
        subdomain,
        index: 'events',
        _source: contentType === 'company' ? 'companyId' : 'customerId',
        positiveQuery: eventPositive,
        negativeQuery: eventNegative,
      });

      propertiesPositive.push({
        terms: {
          _id: await generateElkIds(idsByEvents, subdomain),
        },
      });
    }
  }

  selectorPositiveList.push(...propertiesPositive);
  selectorNegativeList.push(...propertiesNegative);
};
export function elkConvertConditionToQuery(args: {
  field: string;
  type?: any;
  operator: string;
  value: string;
}) {
  const { field, type, operator, value } = args;

  let fixedValue: any = (value || '').includes('now')
    ? value
    : value.toLocaleLowerCase();

  if (['dateigt', 'dateilt', 'drlt', 'drgt'].includes(operator || '')) {
    fixedValue = new Date(value);
  }

  let positiveQuery;
  let negativeQuery;

  // equal
  if (['e', 'numbere'].includes(operator)) {
    if (['keyword', 'email'].includes(type) || operator === 'numbere') {
      positiveQuery = {
        term: { [field]: value },
      };
    } else {
      positiveQuery = {
        match_phrase: { [field]: value },
      };
    }
  }

  // does not equal
  if (['dne', 'numberdne'].includes(operator)) {
    if (['keyword', 'email'].includes(type) || operator === 'numberdne') {
      negativeQuery = {
        term: { [field]: value },
      };
    } else {
      negativeQuery = {
        match_phrase: { [field]: value },
      };
    }
  }

  // contains
  if (operator === 'c') {
    positiveQuery = {
      wildcard: {
        [field]: `*${fixedValue}*`,
      },
    };
  }

  // does not contains
  if (operator === 'dnc') {
    negativeQuery = {
      wildcard: {
        [field]: `*${fixedValue}*`,
      },
    };
  }

  // greater than equal
  if (['igt', 'numberigt', 'dateigt'].includes(operator)) {
    positiveQuery = {
      range: {
        [field]: {
          gte: fixedValue,
        },
      },
    };
  }

  // less then equal
  if (['ilt', 'numberilt', 'dateilt'].includes(operator)) {
    positiveQuery = {
      range: {
        [field]: {
          lte: fixedValue,
        },
      },
    };
  }

  // is true
  if (operator === 'it') {
    positiveQuery = {
      term: {
        [field]: true,
      },
    };
  }

  // is false
  if (operator === 'if') {
    positiveQuery = {
      term: {
        [field]: false,
      },
    };
  }

  // is set
  if (['is', 'dateis'].includes(operator)) {
    positiveQuery = {
      exists: {
        field,
      },
    };
  }

  // is not set
  if (['ins', 'dateins'].includes(operator)) {
    negativeQuery = {
      exists: {
        field,
      },
    };
  }

  if (['woam', 'wobm', 'woad', 'wobd'].includes(operator)) {
    let gte = '';
    let lte = '';

    // will occur after on following n-th minute
    if (operator === 'woam') {
      gte = `now-${fixedValue}m/m`;
      lte = `now-${fixedValue}m/m`;
    }

    // will occur before on following n-th minute
    if (operator === 'wobm') {
      gte = `now+${fixedValue}m/m`;
      lte = `now+${fixedValue}m/m`;
    }

    // will occur after on following n-th day
    if (operator === 'woad') {
      gte = `now-${fixedValue}d/d`;
      lte = `now-${fixedValue}d/d`;
    }

    // will occur before on following n-th day
    if (operator === 'wobd') {
      gte = `now+${fixedValue}d/d`;
      lte = `now+${fixedValue}d/d`;
    }

    positiveQuery = { range: { [field]: { gte, lte } } };
  }

  if (field === 'birthDate' && ['woad', 'wobd'].includes(operator)) {
    const currentDate = new Date();

    if (operator === 'wobd') {
      currentDate.setDate(currentDate.getDate() + Number(fixedValue || ''));
    }

    if (operator === 'woad') {
      currentDate.setDate(currentDate.getDate() - Number(fixedValue || ''));
    }

    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    positiveQuery = {
      wildcard: {
        [field]: `????-${month}-${day < 10 ? '0' + day : day}???:??:??.????`,
      },
    };
  }
  // date relative less than
  if (operator === 'drlt') {
    positiveQuery = { range: { [field]: { lte: fixedValue } } };
  }

  // date relative greater than
  if (operator === 'drgt') {
    positiveQuery = { range: { [field]: { gte: fixedValue } } };
  }

  for (const nestedType of ['customFieldsData', 'trackedData', 'attributes']) {
    if (field.includes(nestedType)) {
      if (positiveQuery) {
        positiveQuery = generateNestedQuery(
          nestedType,
          field,
          operator,
          positiveQuery,
          fixedValue,
        );
      }

      if (negativeQuery) {
        negativeQuery = generateNestedQuery(
          nestedType,
          field,
          operator,
          negativeQuery,
          fixedValue,
        );
      }
    }
  }

  return [positiveQuery, negativeQuery];
}

const associationPropertyFilter = async (
  subdomain: string,
  {
    pluginName,
    mainType,
    propertyType,
    positiveQuery,
    negativeQuery,
  }: {
    pluginName: string;
    mainType: string;
    propertyType: string;
    positiveQuery: any;
    negativeQuery: any;
  },
) => {
  const plugin = await getPlugin(pluginName);
  const segmentMeta = (plugin.config.meta || {}).segments;

  if (segmentMeta && segmentMeta.associationFilterAvailable) {
    return await sendCoreModuleProducer({
      module: 'segments',
      pluginName,
      producerName: TSegmentProducers.ASSOCIATION_FILTER,
      input: {
        mainType,
        propertyType,
        positiveQuery,
        negativeQuery,
      },
      defaultValue: [],
    });
  }

  return [];
};

export const generateNestedQuery = (
  kind: string,
  field: string,
  operator: string,
  query: any,
  fixedValue: any,
) => {
  const fieldKey = field.replace(`${kind}.`, '');

  let fieldValue = 'value';

  if (typeof fixedValue === 'string') {
    fieldValue = 'stringValue';
  }

  if (SEGMENT_NUMBER_OPERATORS.includes(operator)) {
    fieldValue = 'numberValue';
  }

  if (SEGMENT_DATE_OPERATORS.includes(operator)) {
    fieldValue = 'dateValue';
  }

  let updatedQuery = query;

  updatedQuery = JSON.stringify(updatedQuery).replace(
    `${kind}.${fieldKey}`,
    `${kind}.${fieldValue}`,
  );
  updatedQuery = JSON.parse(updatedQuery);

  return {
    nested: {
      path: kind,
      query: {
        bool: {
          must: [
            {
              term: {
                [`${kind}.field`]: fieldKey,
              },
            },
            updatedQuery,
          ],
        },
      },
    },
  };
};
