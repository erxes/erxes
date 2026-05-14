import { useQuery } from '@apollo/client';
import {
  TOUR_CUSTOM_FIELD_GROUPS,
  TOUR_CUSTOM_POST_TYPES,
} from '../graphql/customFields';

export interface ITourCustomPostType {
  _id: string;
  code?: string;
  label?: string;
  pluralLabel?: string;
  description?: string;
}

export interface ITourCustomField {
  _id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  isRequired?: boolean;
}

export interface ITourCustomFieldGroup {
  _id: string;
  label: string;
  code?: string;
  customPostTypeIds?: string[];
  enabledTourIds?: string[];
  enabledTours?: string[];
  fields?: ITourCustomField[];
}

export const useTourCustomTypes = (branchId?: string) => {
  const { data, loading } = useQuery<{
    bmsTourCustomPostTypes: ITourCustomPostType[];
  }>(TOUR_CUSTOM_POST_TYPES, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  return {
    customTypes: data?.bmsTourCustomPostTypes || [],
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
    bmsTourCustomFieldGroupList: { list: ITourCustomFieldGroup[] };
  }>(TOUR_CUSTOM_FIELD_GROUPS, {
    variables: { branchId },
    skip: !branchId || !selectedType,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const fieldGroups = (
    data?.bmsTourCustomFieldGroupList?.list || []
  ).filter((group) => {
    const customPostTypeIds = group.customPostTypeIds || [];

    if (
      customPostTypeIds.length > 0 &&
      !customPostTypeIds.includes(selectedType || '') &&
      !customPostTypeIds.includes('tour')
    ) {
      return false;
    }

    const enabledTourIds = [
      ...(group.enabledTourIds || []),
      ...(group.enabledTours || []),
    ];
    if (enabledTourIds.length > 0 && tourId) {
      return enabledTourIds.includes(tourId);
    }

    return true;
  });

  return {
    fieldGroups,
    loading,
  };
};
