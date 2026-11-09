import { gql, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { PrimitiveAtom, useAtom } from 'jotai';
import { useParams, useSearchParams } from 'react-router-dom';
import { IFieldGroup } from '@/properties/types/Properties';

export const CORE_PROPERTY_PANEL_GROUP = gql`
  query corePropertyPanelGroup($params: FieldGroupParams) {
    fieldGroups(params: $params) {
      list {
        _id
        name
        code
        description
        contentType
        order
        logics
        configs
        owner {
          plugin
          module
          status
        }
      }
    }
  }
`;

export const useGroupPanelSelection = (
  state: PrimitiveAtom<IFieldGroup | null>,
  queryKey: string,
) => {
  const [selected, setSelected] = useAtom(state);
  const [searchParams] = useSearchParams();
  const code = searchParams.get(queryKey);
  const [, setCode] = useQueryState<string>(queryKey);
  const { type: contentType } = useParams<{ type: string }>();
  const selectedMatches =
    !!selected &&
    selected.code === code &&
    selected.contentType === contentType;
  const { data, loading, error } = useQuery<{
    fieldGroups: { list: IFieldGroup[] };
  }>(CORE_PROPERTY_PANEL_GROUP, {
    variables: { params: { contentType, codes: code ? [code] : [], limit: 1 } },
    skip: !code || !contentType || selectedMatches,
  });

  let group: IFieldGroup | null = null;
  if (selectedMatches) {
    group = selected;
  } else if (code) {
    group = data?.fieldGroups.list[0] || null;
  }

  return {
    group,
    open: !!code,
    loading,
    error,
    close: () => {
      setSelected(null);
      setCode(null);
    },
  };
};
