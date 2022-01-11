import { generatePaginationParams } from 'modules/common/utils/router';
import { TargetCount } from 'modules/engage/types';

export const generateListQueryVariables = ({ queryParams }) => ({
  ...generatePaginationParams(queryParams),
  kind: queryParams.kind,
  status: queryParams.status,
  tag: queryParams.tag,
  ids: queryParams.ids
});

export const crudMutationsOptions = () => {
  return {
    refetchQueries: [
      'engageMessages',
      'engageMessagesTotalCount',
      'kindCounts',
      'statusCounts'
    ]
  };
};

export const generateEmailTemplateParams = emailTemplates => {
  return emailTemplates.map(template => ({
    value: template._id,
    label: template.name
  }));
};

/**
 * Sum selected item's customers count
 * @param ids - customer ids
 * @param countValues - customer counts
 */
export const sumCounts = (ids: string[], countValues: TargetCount): number => {
  let sum = 0;

  for (const id of ids) {
    sum += countValues[id] || 0;
  }

  return sum;
};
