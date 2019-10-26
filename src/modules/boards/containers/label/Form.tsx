import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Form from '../../components/label/Form';
import { mutations, queries } from '../../graphql';
import {
  AddPipelineLabelMutationResponse,
  PipelineLabelDetailQueryResponse,
  RemovePipelineLabelMutationResponse
} from '../../types';

type Props = {
  type: string;
  pipelineId: string;
  afterSave: () => void;
  labelId?: string;
  toggleConfirm: (callback?: () => void) => void;
  showForm: boolean;
  selectedLabelIds: string[];
  onSelectLabels: (selectedLabelIds: string[]) => void;
};

type FinalProps = {
  addMutation: AddPipelineLabelMutationResponse;
  pipelineLabelDetailQuery: PipelineLabelDetailQueryResponse;
} & Props &
  RemovePipelineLabelMutationResponse;

const getRefetchQueries = (type: string, pipelineId: string) => {
  return [
    {
      query: gql(queries.pipelineLabels),
      variables: { type, pipelineId }
    }
  ];
};

class FormContainer extends React.Component<FinalProps> {
  render() {
    const {
      type,
      pipelineId,
      pipelineLabelDetailQuery,
      removeMutation,
      toggleConfirm,
      afterSave,
      showForm,
      selectedLabelIds,
      onSelectLabels
    } = this.props;

    const remove = (pipelineLabelId: string) => {
      toggleConfirm(() => {
        confirm('Are you sure? This cannot be undone.', {
          beforeDismiss: () => {
            toggleConfirm();
          }
        }).then(() => {
          removeMutation({
            variables: { _id: pipelineLabelId }
          })
            .then(() => {
              Alert.success('You successfully deleted a label.');

              if (selectedLabelIds.includes(pipelineLabelId)) {
                const remained = selectedLabelIds.filter(
                  (id: string) => pipelineLabelId !== id
                );

                onSelectLabels(remained);
              }
            })
            .catch(error => {
              Alert.error(error.message);
            });
        });
      });
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.pipelineLabelsEdit
              : mutations.pipelineLabelsAdd
          }
          variables={{
            _id: object && object._id ? object._id : undefined,
            pipelineId,
            type,
            ...values
          }}
          callback={callback}
          refetchQueries={getRefetchQueries(type, pipelineId)}
          isSubmitted={isSubmitted}
          type="submit"
          btnSize="small"
          block={!this.props.labelId && true}
          successMessage={`You successfully ${
            object && object._id ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      renderButton,
      afterSave,
      showForm,
      type,
      remove,
      label: pipelineLabelDetailQuery
        ? pipelineLabelDetailQuery.pipelineLabelDetail
        : undefined
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PipelineLabelDetailQueryResponse, { _id: string }>(
      gql(queries.pipelineLabelDetail),
      {
        name: 'pipelineLabelDetailQuery',
        options: ({ labelId }) => ({
          variables: { _id: labelId || '' },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, RemovePipelineLabelMutationResponse, { _id: string }>(
      gql(mutations.pipelineLabelsRemove),
      {
        name: 'removeMutation',
        options: ({ type, pipelineId }) => ({
          refetchQueries: getRefetchQueries(type, pipelineId)
        })
      }
    )
  )(FormContainer)
);
