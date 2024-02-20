import React from 'react';
import SelectSections from '../../components/utils/SelectSections';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../graphql';
import { Alert } from '@erxes/ui/src';
import {
  SectionAddMutationResponse,
  SectionMutationVariables,
  SectionsListQueryResponse,
} from '../../types';

type Props = {
  type: 'dashboard' | 'goal' | 'report';
  sectionId: string;
  setSectionId: (value: string) => void;
};

const SelectSectionsContainer = (props: Props) => {
  const { type } = props;

  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: { type },
    },
  );

  const sections = sectionsQuery?.data?.sections || [];

  const [sectionAdd] = useMutation<SectionAddMutationResponse>(
    gql(mutations.sectionAdd),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: {
            type,
          },
        },
      ],
    },
  );

  const addSection = (values: SectionMutationVariables) => {
    sectionAdd({ variables: { ...values } })
      .then(() => {
        Alert.success('Successfully added section');
      })
      .catch((err) => Alert.error(err.message));
  };

  const updatedProps = {
    ...props,
    sections,
    addSection,
  };

  return <SelectSections {...updatedProps} />;
};

export default SelectSectionsContainer;
