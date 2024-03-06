import React from 'react';

import { gql, useQuery, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';

import SelectSections from '../../components/utils/SelectSections';
import { queries, mutations } from '../../graphql';
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
  const { type, setSectionId } = props;

  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: { type },
    },
  );

  const sections = sectionsQuery?.data?.sections || [];

  const [sectionAdd] = useMutation(gql(mutations.sectionAdd), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: {
          type,
        },
      },
    ],
  });

  const addSection = (values: SectionMutationVariables) => {
    sectionAdd({ variables: { ...values } })
      .then((res) => {
        const { _id } = res.data.sectionAdd;
        if (_id) {
          setSectionId(_id);
        }
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
