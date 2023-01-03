import { Alert, ButtonMutate, Chooser, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ICardRiskAssessmentDetailQueryResponse,
  ICardRiskAssessmentsQueryResponse
} from '../../common/types';
import AddRiskAssessmentForm from '../../containers/Form';
import { mutations as riskAssessmentMutattions } from '../../graphql';
import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
  id?: string;
  riskAssessmentId?: string;
  refetch: () => void;
  refetchSubmissions: () => void;
};

type FinalProps = {
  riskAssessmentsQuery: ICardRiskAssessmentsQueryResponse;
  conformityDetail: ICardRiskAssessmentDetailQueryResponse;
  addConformity: any;
  editconformity: any;
  removeConformity: any;
} & Props;

type State = {
  perpage: number;
};

class RiskAssessmentForm extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      perpage: 5
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  renderAddForm(props) {
    const generateDoc = values => {
      return { ...values };
    };

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={riskAssessmentMutattions.riskAssessmentAdd}
          variables={values}
          callback={callback}
          refetchQueries={refetchQueries}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully added risk assessment`}
        />
      );
    };

    return (
      <AddRiskAssessmentForm
        {...props}
        renderButton={renderButton}
        generateDoc={generateDoc}
      />
    );
  }

  handleSelect = item => {
    const {
      id,
      refetch,
      addConformity,
      conformityDetail,
      editconformity,
      removeConformity,
      refetchSubmissions
    } = this.props;

    if (item.length === 0) {
      return removeConformity({ variables: { cardId: id } })
        .then(() => {
          refetch();
          refetchSubmissions();
        })
        .catch(e => Alert.error(e.message));
    }

    const variables = {
      cardId: id,
      riskAssessmentId: item[0]._id
    };

    if (
      conformityDetail.riskConformityDetails &&
      conformityDetail.riskConformityDetails.length > 0
    ) {
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

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perpage: 0 });
    }

    this.setState({ perpage: this.state.perpage + 5 }, () =>
      this.props.riskAssessmentsQuery.refetch({
        searchValue: value,
        perPage: this.state.perpage
      })
    );
  };
  render() {
    const { conformityDetail, riskAssessmentsQuery, closeModal } = this.props;
    const { perpage } = this.state;

    const selectedItems: any[] = [];

    if (riskAssessmentsQuery.loading || conformityDetail.loading) {
      return <Spinner objective />;
    }
    for (const detail of conformityDetail?.riskConformityDetails) {
      selectedItems.push(detail.riskAssessment);
    }

    console.log({ riskAssessmentsQuery });

    const list = riskAssessmentsQuery.riskAssessments || [];

    return (
      <Chooser
        title="Risk Assessment Forms"
        datas={list}
        data={{ name: 'name', datas: selectedItems }}
        search={this.search}
        clearState={() => this.search('', true)}
        renderName={category => category.name}
        renderForm={this.renderAddForm}
        onSelect={this.handleSelect}
        closeModal={() => closeModal()}
        perPage={perpage}
        limit={1}
      />
    );
  }
}

const refetchQueries = ({ id }) => ({
  refetchQueries: [
    {
      query: gql(queries.riskConformityDetails),
      variables: { cardId: id }
    },
    {
      query: gql(queries.riskConformityDetails)
    }
  ]
});

export default withProps<Props>(
  compose(
    //Query

    graphql<Props>(gql(queries.riskAssessments), {
      name: 'riskAssessmentsQuery',
      skip: ({ id }) => !id,
      options: ({}) => ({
        variables: {
          perPage: 20,
          searchValue: ''
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.riskConformityDetails), {
      name: 'conformityDetail',
      options: ({ id }) => ({ variables: { cardId: id } }),
      skip: ({ id }) => !isEnabled('riskassessment') || !id
    }),

    //Mutation

    graphql<Props>(gql(mutations.conformityRiskAssessment), {
      name: 'addConformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    }),
    graphql<Props>(gql(mutations.editConformityRiskAssessment), {
      name: 'editconformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    }),
    graphql<Props>(gql(mutations.removeConformityRiskAssessment), {
      name: 'removeConformity',
      skip: ({ id }) => !id,
      options: ({ id }) => refetchQueries({ id })
    })
  )(RiskAssessmentForm)
);
