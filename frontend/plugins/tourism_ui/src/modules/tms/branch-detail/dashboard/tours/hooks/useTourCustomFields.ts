import { useQuery } from '@apollo/client';
import {
  TOUR_CUSTOM_FIELD_GROUPS,
  TOUR_CUSTOM_TYPES,
} from '../graphql/customFields';

export interface ITourCustomPostType {
  _id: string;
  branchId?: string;
  code?: string;
  name?: string;
  label?: string;
  pluralLabel?: string;
  description?: string;
  isActive?: boolean;
}

export interface ITourCustomField {
  _id?: string;
  type: string;
  label: string;
  code?: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  isRequired?: boolean;
}

export interface ITourCustomFieldGroup {
  _id: string;
  label: string;
  code?: string;
  branchId?: string;
  parentId?: string;
  order?: number;
  customTourTypeIds?: string[];
  enabledTourIds?: string[];
  fields?: ITourCustomField[];
}

export const useTourCustomTypes = (branchId?: string) => {
  const { data, loading } = useQuery<{
    bmsCustomTourTypes: ITourCustomPostType[];
  }>(TOUR_CUSTOM_TYPES, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const systemTourType: ITourCustomPostType = {
    _id: 'tour',
    branchId,
    code: 'tour',
    name: 'tour',
    label: 'Tour',
    pluralLabel: 'Tours',
    isActive: true,
  };

  const customTypes = (data?.bmsCustomTourTypes || []).filter(
    (type) => type.isActive !== false,
  );

  return {
    customTypes: [systemTourType, ...customTypes],
    loading,
  };
};

export const useTourCustomFieldGroups = ({
  branchId,
  selectedType,
  tourId,
}: {
  branchId?: string;
  selectedType?: string;
  tourId?: string;
}) => {
  const { data, loading } = useQuery<{
    bmsCustomTourGroupList: { list: ITourCustomFieldGroup[] };
  }>(TOUR_CUSTOM_FIELD_GROUPS, {
    variables: { branchId },
    skip: !branchId || !selectedType,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const fieldGroups = (data?.bmsCustomTourGroupList?.list || []).filter(
    (group) => {
      const customTourTypeIds = group.customTourTypeIds || [];
      const enabledTourIds = group.enabledTourIds || [];
      const matchesTour = !!tourId && enabledTourIds.includes(tourId);
      const matchesType =
        customTourTypeIds.length === 0 ||
        customTourTypeIds.includes(selectedType || 'tour');

      return matchesType || matchesTour;
    },
  );

  return {
    fieldGroups,
    loading,
  };
};
