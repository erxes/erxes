import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { ButtonMutate, Spinner } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { IAssignment, SegmentsDetailQueryResponse } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations, queries } from '../graphql';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  assignment: IAssignment;
  getAssociatedAssignment?: (assignmentId: string) => void;
  closeModal: () => void;
  queryParams: any;
  history: any;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  segmentsDetailQuery: SegmentsDetailQueryResponse;
} & Props;

class AssignmentFromContainer extends React.Component<FinalProps> {
  render() {
    const { segmentsDetailQuery, history, queryParams } = this.props;

    if (segmentsDetailQuery.loading) {
      <Spinner />;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedAssignment } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedAssignment) {
          getAssociatedAssignment(data.assignmentsAdd);
        }
      };

      if (this.props.queryParams) {
        values.segmentIds = this.props.queryParams.segmentIds
          ? this.props.queryParams.segmentIds
            ? JSON.parse(this.props.queryParams.segmentIds)
            : []
          : [];
      }

      return (
        <ButtonMutate
          mutation={
            object ? mutations.assignmentsEdit : mutations.assignmentsAdd
          }
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const segmentsDetail = segmentsDetailQuery.segmentsDetail || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      segmentsDetail,
      history,
      queryParams
    };
    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'assignmentsMain',
    'assignmentDetail',
    'assignments',
    'assignmentCounts',
    'assignmentCampaigns',
    'assignmentCampaignsTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, SegmentsDetailQueryResponse>(gql(queries.segmentsDetail), {
      name: 'segmentsDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _ids:
            queryParams === undefined
              ? []
              : queryParams.segmentIds
              ? JSON.parse(queryParams.segmentIds)
              : []
        }
      })
    })
  )(AssignmentFromContainer)
);
