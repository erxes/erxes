import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import ItemChooser from '../../boards/components/portable/ItemChooser';
import Chooser, { CommonProps } from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { mutations } from '../graphql';
import { EditConformityMutation, IConformityEdit } from '../types';

type Props = {
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  onSelect?: (datas: any[]) => void;
  stageId?: string;
  boardId?: string;
  pipelineId?: string;
  refetchQuery: string;
  chooserComponent?: any;
} & CommonProps;

type FinalProps = {
  editConformityMutation: EditConformityMutation;
} & Props;

const ConformityChooser = (props: FinalProps) => {
  const {
    editConformityMutation,
    data,
    onSelect,
    chooserComponent,
    refetchQuery
  } = props;

  const onSelected = relTypes => {
    const relTypeIds = relTypes.map(item => item._id);
    const update = cache => {
      const variables: any = {
        mainType: data.mainType,
        mainTypeId: data.mainTypeId,
        relType: data.relType,
        isSaved: true
      };

      // add archived items in contacts side bar
      if (data.mainType === 'customer' || data.mainType === 'company') {
        variables.noSkipArchive = true;
      }

      const selector: { query: any; variables?: any } = {
        query: gql(refetchQuery),
        variables
      };
      const qryName = gql(refetchQuery).definitions[0].name.value;

      cache.updateQuery(selector, _data => ({
        [qryName]: relTypes
      }));
    };

    editConformityMutation({
      variables: {
        mainType: data.mainType,
        mainTypeId: data.mainTypeId,
        relType: data.relType,
        relTypeIds
      },
      optimisticResponse: {
        __typename: 'Mutation',
        conformityEdit: relTypes
      },
      update
    })
      .then(() => {
        if (onSelect) {
          onSelect(relTypes);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    onSelect: onSelected
  };

  if (chooserComponent) {
    const Component = chooserComponent;
    return <Component {...extendedProps} />;
  }

  if (props.data.options) {
    return <ItemChooser {...extendedProps} />;
  }

  return <Chooser {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      EditConformityMutation,
      IConformityEdit & { isSaved?: boolean }
    >(gql(mutations.conformityEdit), {
      name: 'editConformityMutation',
      options: () => {
        return {
          refetchQueries: ['activityLogs']
        };
      }
    })
  )(ConformityChooser)
);
