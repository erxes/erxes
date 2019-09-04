import gql from 'graphql-tag';
import ItemChooser from 'modules/boards/components/portable/ItemChooser';
import Chooser from 'modules/common/components/Chooser';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations } from '../graphql';
import { EditConformityMutation, IConformityEdit } from '../types';

type Props = {
  search: (value: string, reload?: boolean) => void;
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  clearState: () => void;
  renderForm: (props: { closeModal: () => void }) => any;
  renderName: (data: any) => void;
  closeModal: () => void;
  title: string;
  data: any;
  datas: any[];
  perPage: number;
  limit?: number;
  add?: any;
  stageId?: string;
  boardId?: string;
  pipelineId?: string;
  showSelect?: boolean;
  refetchQuery: string;
};

type FinalProps = {
  editConformityMutation: EditConformityMutation;
} & Props;

const ConformityChooser = (props: FinalProps) => {
  const { editConformityMutation, data } = props;

  const onSelect = relTypes => {
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
        Alert.success('Success changed ' + data.relType);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (props.data.options) {
    return <ItemChooser {...props} onSelect={onSelect} />;
  }

  return <Chooser {...props} onSelect={onSelect} />;
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
            }
          ]
        };
      }
    })
  )(ConformityChooser)
);
