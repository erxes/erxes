import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import Section from '../components/Section';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import { Alert, Spinner } from '@erxes/ui/src';

type Props = {
  mainTypeId: string;
  mainType: string;
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  rcfaDetail: any;
  addRcfaQuestions: any;
  editRcfaQuestions: any;
  deleteRcfaIssue: any;
  closeRcfaIssue: any;
  createActionInRoot: any;
} & Props;

class SectionContainer extends React.Component<FinalProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const {
      rcfaDetail,
      addRcfaQuestions,
      editRcfaQuestions,
      closeRcfaIssue,
      deleteRcfaIssue,
      createActionInRoot,
      mainType,
      mainTypeId
    } = this.props;

    if (rcfaDetail.loading) {
      return <Spinner />;
    }

    const addIssue = (data, callback) => {
      const payload = {
        ...data,
        mainType: mainType,
        mainTypeId: mainTypeId
      };
      addRcfaQuestions({ variables: payload })
        .then(() => {
          rcfaDetail.refetch();
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    const editIssue = (_id: string, doc: any) => {
      editRcfaQuestions({ variables: { _id, doc: { ...doc } } }).catch(err =>
        Alert.error(err.message)
      );
    };

    const removeIssue = (_id: string) => {
      deleteRcfaIssue({ variables: { _id } }).catch(err =>
        Alert.error(err.message)
      );
    };

    const closeIssue = _id => {
      closeRcfaIssue({ variables: { _id } }).catch(err => {
        Alert.error(err.message);
      });
    };

    const createRootAction = variables => {
      createActionInRoot({ variables })
        .then(() => {
          Alert.success('Successfully created root action');
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    const { issues, ...detail } = rcfaDetail?.rcfaDetail || {};

    const updateProps = {
      issues: issues || [],
      detail,
      addIssue,
      editIssue,
      removeIssue,
      closeIssue,
      createRootAction,
      createActionInRoot,
      mainType,
      mainTypeId
    };

    return <Section {...updateProps} />;
  }
}

export const refetchQueries = ({ mainTypeId }) => [
  {
    query: gql(queries.rcfaDetail),
    variables: {
      mainType: 'ticket',
      mainTypeId: mainTypeId
    }
  }
];

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.rcfaDetail), {
      name: 'rcfaDetail',
      options: (props: any) => ({
        variables: {
          mainType: 'ticket',
          mainTypeId: props.mainTypeId
        }
      })
    }),
    graphql<Props>(gql(mutations.addIssue), {
      name: 'addRcfaQuestions',
      options: props => ({ refetchQueries: refetchQueries(props) })
    }),
    graphql<Props>(gql(mutations.editIssue), {
      name: 'editRcfaQuestions',
      options: props => ({ refetchQueries: refetchQueries(props) })
    }),
    graphql<Props>(gql(mutations.removeIssue), {
      name: 'deleteRcfaIssue',
      options: props => ({ refetchQueries: refetchQueries(props) })
    }),
    graphql<Props>(gql(mutations.closeIssue), {
      name: 'closeRcfaIssue',
      options: props => ({ refetchQueries: refetchQueries(props) })
    }),
    graphql<Props>(gql(mutations.createActionInRoot), {
      name: 'createActionInRoot',
      options: props => ({ refetchQueries: refetchQueries(props) })
    })
  )(SectionContainer)
);
