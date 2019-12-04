import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ItemChooser from 'modules/boards/components/portable/ItemChooser';
import Chooser, { CommonProps } from 'modules/common/components/Chooser';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
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
  showSelect?: boolean;
  refetchQuery: string;
} & CommonProps;

type FinalProps = {
  editConformityMutation: EditConformityMutation;
} & Props;

const ConformityChooser = (props: FinalProps) => {
  const { editConformityMutation, data, onSelect } = props;

  const onSelected = relTypes => {
    const relTypeIds = relTypes.map(item => item._id);

    editConformityMutation({
      variables: {
        mainType: data.mainType,
        mainTypeId: data.mainTypeId,
        relType: data.relType,
        relTypeIds
      }
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

  if (props.data.options) {
    return <ItemChooser {...props} onSelect={onSelected} />;
  }

  return <Chooser {...props} onSelect={onSelected} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      EditConformityMutation,
      IConformityEdit & { isSaved?: boolean }
    >(gql(mutations.conformityEdit), {
      name: 'editConformityMutation',
      options: ({ data, refetchQuery }) => {
        return {
          refetchQueries: [
            {
              query: gql(refetchQuery),
              variables: {
                mainType: data.mainType,
                mainTypeId: data.mainTypeId,
                relType: data.relType,
                isSaved: true
              }
            },
            'activityLogs'
          ]
        };
      }
    })
  )(ConformityChooser)
);
