import {
  Alert,
  ButtonMutate,
  Chooser,
  ControlLabel,
  FormGroup,
  Spinner,
  __
} from '@erxes/ui/src';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
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
import AddRiskAssessmentForm from '../../indicator/containers/Form';
import { mutations as riskIndicatorMutattions } from '../../indicator/graphql';
import { mutations, queries } from '../graphql';
import { FormContainer, FormContent } from '../../styles';

type Props = {
  closeModal: () => void;
  id?: string;
  riskAssessmentId?: string;
  refetch: () => void;
  refetchSubmissions: () => void;
};

type FinalProps = {
  riskIndicatorsQuery: ICardRiskAssessmentsQueryResponse;
  conformityDetail: ICardRiskAssessmentDetailQueryResponse;
  addConformity: any;
  editconformity: any;
  removeConformity: any;
} & Props;

type State = {
  perpage: number;
  branchIds: string[];
  departmentIds: string[];
};

class RiskAssessmentForm extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      perpage: 5,
      branchIds: [],
      departmentIds: []
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
          mutation={riskIndicatorMutattions.riskIndicatorAdd}
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

  handleSelect = items => {
    const {
      id,
      refetch,
      addConformity,
      conformityDetail,
      editconformity,
      removeConformity,
      refetchSubmissions
    } = this.props;

    if (items.length === 0) {
      return removeConformity({ variables: { cardId: id } })
        .then(() => {
          refetch();
          refetchSubmissions();
        })
        .catch(e => Alert.error(e.message));
    }

    const variables = {
      cardId: id,
      riskIndicatorIds: items.map(item => item._id)
    };

    if (
      conformityDetail.riskConformityDetail.riskIndicators &&
      !!conformityDetail.riskConformityDetail.riskIndicatorIds.length
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
      this.props.riskIndicatorsQuery.refetch({
        searchValue: value,
        perPage: this.state.perpage
      })
    );
  };

  renderChooser() {
    const { conformityDetail, riskIndicatorsQuery, closeModal } = this.props;
    const { perpage } = this.state;

    const { riskConformityDetail } = conformityDetail;

    if (riskIndicatorsQuery.loading || conformityDetail.loading) {
      return <Spinner objective />;
    }

    const selectedItems: any[] = [];

    for (const riskIndicator of riskConformityDetail?.riskIndicators || []) {
      selectedItems.push(riskIndicator.detail);
    }

    const updateProps = {
      title: 'Risk Assessment Indicators',
      datas: riskIndicatorsQuery.riskIndicators || [],
      data: { name: 'name', datas: selectedItems },
      search: this.search,
      clearState: () => this.search('', true),
      renderName: category => category.name,
      renderForm: this.renderAddForm,
      onSelect: this.handleSelect,
      closeModal: () => closeModal(),
      perPage: perpage
    };
    return <Chooser {...updateProps} />;
  }
  render() {
    const { departmentIds, branchIds } = this.state;

    const handleSelect = (name, value) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };

    return (
      <FormContainer column gap>
        <FormContent>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchIds"
              label="Select Branches"
              initialValue={branchIds}
              onSelect={value => handleSelect('branchIds', value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Department')}</ControlLabel>
            <SelectDepartments
              name="departmentIds"
              label="Select Departments"
              initialValue={departmentIds}
              onSelect={value => handleSelect('departmentIds', value)}
            />
          </FormGroup>
        </FormContent>
        <FormContent>{this.renderChooser()}</FormContent>
      </FormContainer>
    );
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

    graphql<Props>(gql(queries.riskIndicators), {
      name: 'riskIndicatorsQuery',
      skip: ({ id }) => !id,
      options: ({}) => ({
        variables: {
          perPage: 20,
          searchValue: ''
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(queries.riskConformityDetail), {
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
