import React from 'react';

import { gql, useMutation } from '@apollo/client';

import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { __ } from '@erxes/ui/src/utils/index';
import { router } from '@erxes/ui/src/utils';

import List from '../../components/section/List';
import { queries, mutations } from '../../graphql';
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
  renderAdditionalActions?: (item: any) => void;
};

const SectionListContainer = (props: Props) => {
  const { queryParamName, section } = props;
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

  if(!section?.list?.length) {
    return null
  }

  const updatedProps = {
    ...props,
    removeSection,
  };

  return <List {...updatedProps} />;
};

export default SectionListContainer;
