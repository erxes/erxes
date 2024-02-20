import React from 'react';
import List from '../../components/section/List';
import { gql, useMutation } from '@apollo/client';
import { queries, mutations } from '../../graphql';
import { Alert, __, confirm, router } from '@erxes/ui/src';
import {
  IDashboard,
  IReport,
  ISection,
  SectionRemoveMutationResponse,
} from '../../types';

type Props = {
  queryParamName: string;
  queryParams: any;
  section: ISection;
  list: IReport[] | IDashboard[];
  handleClick?: (id: string) => void;
  renderEditAction?: (item: any) => void;
  renderRemoveAction?: (item: any) => void;
};

const SectionListContainer = (props: Props) => {
  const { queryParamName } = props;
  const entityType = queryParamName.split(/(?=[A-Z])/)[0].toLowerCase();

  const [sectionRemoveMutation] = useMutation<SectionRemoveMutationResponse>(
    gql(mutations.sectionRemove),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: entityType },
        },
        {
          query: gql(queries[entityType + 'List']),
        },
      ],
    },
  );

  const removeSection = (id: string) => {
    confirm(__('Are you sure to delete selected section?')).then(() => {
      sectionRemoveMutation({
        variables: { id },
      })
        .then(() => {
          Alert.success('You successfully deleted a section');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    removeSection,
  };

  return <List {...updatedProps} />;
};

export default SectionListContainer;
