import { gql, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { PrimitiveAtom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IFieldGroup } from '../types/Properties';

const CORE_PROPERTY_PANEL_GROUP = gql`
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
  const [code, setCode] = useQueryState<string>(queryKey);
  const { type: contentType } = useParams<{ type: string }>();
  const { data, loading, error } = useQuery<{
    fieldGroups: { list: IFieldGroup[] };
  }>(CORE_PROPERTY_PANEL_GROUP, {
    variables: { params: { contentType, codes: code ? [code] : [], limit: 1 } },
    skip: !code || !contentType || !!selected,
  });
  useEffect(() => {
    if (selected?.code && selected.code !== code) setCode(selected.code);
  }, [selected, code, setCode]);

  return {
    group: selected || (code ? data?.fieldGroups.list[0] : null) || null,
    loading,
    error,
    close: () => {
      setSelected(null);
      setCode(null);
    },
  };
};
