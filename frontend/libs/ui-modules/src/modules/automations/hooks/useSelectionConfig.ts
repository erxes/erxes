import { gql } from '@apollo/client';
import { useQuerySelectInputList } from 'ui-modules/modules/segments';

export const useSelectionConfig = (selectionConfig: {
  queryName: string;
  labelField: string;
  valueField?: string;
}) => {
  const { queryName, labelField, valueField = '_id' } = selectionConfig || {};
  const query = gql`
          query ${queryName}($searchValue: String,$direction: CURSOR_DIRECTION,$cursor: String,$limit:Int) {
            ${queryName}(searchValue: $searchValue,direction:$direction,cursor:$cursor,limit:$limit) {
              list{${labelField},${valueField}}
              totalCount,
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `;
  const {
    list = [],
    totalCount = 0,
    handleFetchMore,
    loading,
  } = useQuerySelectInputList(query, queryName, '', !selectionConfig);
  const items = list.map((option: any) => ({
    label: option[labelField],
    value: option[valueField],
  }));

  return {
    list,
    totalCount,
    handleFetchMore,
    loading,
    items,
  };
};
