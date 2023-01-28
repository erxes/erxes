import { Alert, Button, Spinner, __ } from '@erxes/ui/src';
import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ICardRiskAssessmentDetailQueryResponse,
  ICardRiskAssessmentsQueryResponse,
  IConformityDetail
} from '../common/types';
import { mutations, queries } from '../graphql';
import FormComponent from '../component/Form';

type Props = {
  closeModal: () => void;
  id?: string;
  riskAssessmentId?: string;
  refetch: () => void;
  refetchSubmissions: () => void;
};

type FinalProps = {
  conformityDetail: ICardRiskAssessmentDetailQueryResponse;
  addConformity: any;
  editconformity: any;
  removeConformity: any;
} & Props;

class RiskAssessmentForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect = (doc: any, detail?: any) => {
    const {
      id,
      refetch,
      addConformity,
      conformityDetail,
      editconformity,
      removeConformity,
      refetchSubmissions
    } = this.props;

    if (detail && !doc.indicatorId && !doc.groupId) {
      return removeConformity({ variables: { cardId: id } })
        .then(() => {
          refetch();
          refetchSubmissions();
        })
        .catch(e => Alert.error(e.message));
    }

    const variables = {
      cardId: id,
      ...doc
    };
    console.log({ variables });
    if (detail) {
      return editconformity({ variables })
        .then(() => {
          refetch();
          refetchSubmissions();
        })
        .catch(e => Alert.error(e.message));
    }

    addConformity({ variables })
      .then(() => {
        refetch();
        refetchSubmissions();
      })
      .catch(e => Alert.error(e.message));
  };

  render() {
    const { conformityDetail, closeModal } = this.props;

    if (conformityDetail?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      detail: conformityDetail?.riskConformityDetail,
      refetchQueries,
      closeModal,
      handleSelect: this.handleSelect
    };

    return <FormComponent {...updatedProps} />;
  }
}

const refetchQueries = ({ id }) => ({
  refetchQueries: [
    {
      query: gql(queries.riskConformityDetail),
      variables: { cardId: id }
    },
    {
      query: gql(queries.riskConformityDetail)
    }
  ]
});

export default withProps<Props>(
  compose(
    //Query
    graphql<Props>(gql(queries.riskConformityDetail), {
      name: 'conformityDetail',
      options: ({ id }) => ({ variables: { cardId: id } }),
      skip: ({ id }) => !isEnabled('riskassessment') || !id
    }),

    //Mutation

    graphql<Props>(gql(mutations.addConformity), {
      name: 'addConformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    }),
    graphql<Props>(gql(mutations.editConformity), {
      name: 'editconformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    }),
    graphql<Props>(gql(mutations.removeConformity), {
      name: 'removeConformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    })
  )(RiskAssessmentForm)
);
