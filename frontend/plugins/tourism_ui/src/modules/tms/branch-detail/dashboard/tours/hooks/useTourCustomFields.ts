import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  TOUR_CUSTOM_FIELD_GROUPS,
  TOUR_CUSTOM_TYPES,
} from '../graphql/customFields';
import type {
  TourismTourCustomFieldGroupsQuery,
  TourismTourCustomTypesQuery,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export type ITourCustomPostType = NonNullable<
  NonNullable<TourismTourCustomTypesQuery['bmsCustomTourTypes']>[number]
>;

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

type TourCustomFieldGroupResult = NonNullable<
  NonNullable<
    NonNullable<
      TourismTourCustomFieldGroupsQuery['bmsCustomTourGroupList']
    >['list']
  >[number]
>;

export type ITourCustomFieldGroup = Omit<
  TourCustomFieldGroupResult,
  'fields'
> & {
  fields: ITourCustomField[];
};

/**
 * Reads a group's `fields` JSON scalar as the fields this UI saved. Every entry
 * is kept: the custom fields page writes the whole array back, so a dropped
 * entry would be deleted.
 */
export const toTourCustomFields = (fields: unknown): ITourCustomField[] =>
  Array.isArray(fields) ? (fields as ITourCustomField[]) : [];

export const toTourCustomFieldGroup = (
  group: TourCustomFieldGroupResult,
): ITourCustomFieldGroup => ({
  ...group,
  fields: toTourCustomFields(group.fields),
});

export const useTourCustomTypes = (branchId?: string | null) => {
  const { data, loading } = useQuery(TOUR_CUSTOM_TYPES, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const types = data?.bmsCustomTourTypes;
  const customTypes = useMemo(() => {
    const systemTourType: ITourCustomPostType = {
      _id: 'tour',
      branchId: branchId ?? '',
      code: 'tour',
      name: 'tour',
      label: 'Tour',
      pluralLabel: 'Tours',
      description: null,
      isActive: true,
    };

    return [
      systemTourType,
      ...compactList(types).filter((type) => type.isActive !== false),
    ];
  }, [branchId, types]);

  return {
    customTypes,
    loading,
  };
};

export const useTourCustomFieldGroups = ({
  branchId,
  selectedType,
  tourId,
}: {
  branchId?: string | null;
  selectedType?: string;
  tourId?: string;
}) => {
  const { data, loading } = useQuery(TOUR_CUSTOM_FIELD_GROUPS, {
    variables: branchId ? { branchId } : undefined,
    skip: !branchId || !selectedType,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const list = data?.bmsCustomTourGroupList?.list;
  const fieldGroups = useMemo(
    () =>
      compactList(list)
        .map(toTourCustomFieldGroup)
        .filter((group) => {
          const customTourTypeIds = compactList(group.customTourTypeIds);
          const enabledTourIds = compactList(group.enabledTourIds);
          const matchesTour = !!tourId && enabledTourIds.includes(tourId);
          const matchesType =
            customTourTypeIds.length === 0 ||
            customTourTypeIds.includes(selectedType || 'tour');

          return matchesType || matchesTour;
        }),
    [list, selectedType, tourId],
  );

  return {
    fieldGroups,
    loading,
  };
};
