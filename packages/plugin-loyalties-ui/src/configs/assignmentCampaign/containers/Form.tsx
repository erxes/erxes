import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import {
  AssignmentCampaignQueryResponse,
  IAssignmentCampaign,
  SegmentsDetailQueryResponse
} from '../types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  assignmentCampaign?: IAssignmentCampaign;
  history: any;
  queryParams: any;
  closeModal: () => void;
};

type FinalProps = {
  assignmentCampaignsQuery: AssignmentCampaignQueryResponse;
  segmentsDetailQuery: SegmentsDetailQueryResponse;
} & Props;

class AssignmentFormContainer extends React.Component<FinalProps> {
  render() {
    const { segmentsDetailQuery } = this.props;

    if (segmentsDetailQuery.loading) {
      return (
        <>
          <Spinner objective={true} size={18} />
          Loading...
        </>
      );
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const attachmentMoreArray: any[] = [];
      const attachment = values.attachment || undefined;
      const attachmentMore = values.attachmentMore || [];

      attachmentMore.map(att => {
        attachmentMoreArray.push({ ...att, __typename: undefined });
      });

      values.attachment = attachment
        ? { ...attachment, __typename: undefined }
        : null;
      values.attachmentMore = attachmentMoreArray;

      values.segmentIds = this.props.queryParams.segmentIds
        ? JSON.parse(this.props.queryParams.segmentIds)
        : [];

      return (
        <ButtonMutate
          mutation={
            object && object._id
              ? mutations.assignmentCampaignsEdit
              : mutations.assignmentCampaignsAdd
          }
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const segmentDetails = segmentsDetailQuery.segmentsDetail || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      segmentDetails
    };

    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assignmentCampaigns'];
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsDetailQueryResponse>(gql(queries.segmentsDetail), {
      name: 'segmentsDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _ids:
            queryParams.segmentIds === undefined
              ? []
              : JSON.parse(queryParams.segmentIds)
        }
      })
    })
  )(AssignmentFormContainer)
);
