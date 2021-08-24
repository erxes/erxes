import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import {
  IItem,
  IPipelineLabel,
  PipelineLabelsQueryResponse
} from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { graphql } from 'react-apollo';
import LabelChooser from '../../components/label/LabelChooser';
import { mutations, queries } from '../../graphql';
import {
  PipelineLabelMutationResponse,
  PipelineLabelMutationVariables
} from '../../types';

type Props = {
  item: IItem;
  onSelect?: (labels: IPipelineLabel[]) => void;
  onChangeRefresh: () => void;
};

type FinalProps = {
  pipelineLabelsQuery: PipelineLabelsQueryResponse;
} & Props &
  PipelineLabelMutationResponse;

class LabelChooserContainer extends React.Component<
  FinalProps,
  { isConfirmVisible: boolean }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      isConfirmVisible: false
    };
  }

  toggleConfirm = (callback?: () => void) => {
    const { isConfirmVisible } = this.state;

    this.setState({ isConfirmVisible: !isConfirmVisible }, callback);
  };

  render() {
    const {
      pipelineLabelsQuery,
      pipelineLabelMutation,
      item,
      onSelect,
      onChangeRefresh
    } = this.props;

    if (pipelineLabelsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const pipelineId = item.pipeline._id;
    const labels = pipelineLabelsQuery.pipelineLabels || [];

    const doLabel = (selectedLabelIds: string[]) => {
      const variables = {
        pipelineId,
        targetId: item._id,
        labelIds: selectedLabelIds
      };

      pipelineLabelMutation({ variables })
        .then(() => {
          if (onSelect) {
            onSelect(
              labels.filter(label => selectedLabelIds.includes(label._id || ''))
            );
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      pipelineId: item.pipeline._id,
      selectedLabelIds: item.labelIds || [],
      labels,
      doLabel,
      isConfirmVisible: this.state.isConfirmVisible,
      onChangeRefresh,
      toggleConfirm: this.toggleConfirm
    };

    return <LabelChooser {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      PipelineLabelMutationResponse,
      PipelineLabelMutationVariables
    >(gql(mutations.pipelineLabelsLabel), {
      name: 'pipelineLabelMutation'
    }),
    graphql<Props, PipelineLabelsQueryResponse, { pipelineId: string }>(
      gql(queries.pipelineLabels),
      {
        name: 'pipelineLabelsQuery',
        options: ({ item }) => ({
          variables: {
            pipelineId: item.pipeline._id
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(LabelChooserContainer)
);
