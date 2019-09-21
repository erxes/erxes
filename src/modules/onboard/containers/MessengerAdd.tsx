import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { BrandsQueryResponse } from 'modules/settings/brands/types';
import {
  mutations,
  queries as integrationQuery
} from 'modules/settings/integrations/graphql';
import {
  IIntegration,
  IntegrationsCountQueryResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import MessengerAdd from '../components/MessengerAdd';
import { OnboardConsumer } from '../containers/OnboardContext';
import { queries } from '../graphql';

type Props = {
  brandsQuery: BrandsQueryResponse;
  totalCountQuery: IntegrationsCountQueryResponse;
  changeStep: (increase: boolean) => void;
};

type State = {
  integration: IIntegration;
  isVisibleCodeModal: boolean;
};

class MessengerAddContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { integration: {} as IIntegration, isVisibleCodeModal: false };
  }

  closeCodeModal = () => {
    this.setState({ isVisibleCodeModal: false });
  };

  render() {
    const { brandsQuery, totalCountQuery } = this.props;
    const { isVisibleCodeModal, integration } = this.state;

    let totalCount = 0;

    if (!totalCountQuery.loading) {
      totalCount = totalCountQuery.integrationsTotalCount.byKind.messenger;
    }

    const brands = brandsQuery.brands || [];

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const callBackResponse = data => {
        this.setState({
          integration: data.integrationsCreateMessengerIntegration,
          isVisibleCodeModal: true
        });

        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={mutations.integrationsCreateMessenger}
          variables={values}
          callback={callBackResponse}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          disabled={!values}
          type="submit"
          icon="arrow-right"
          successMessage={`You successfully added an ${name}`}
        >
          {__('Continue')}
        </ButtonMutate>
      );
    };

    const updatedProps = {
      ...this.props,
      brands,
      renderButton,
      integration,
      totalCount,
      showInstallCode: isVisibleCodeModal,
      closeInstallCodeModal: this.closeCodeModal
    };

    return <MessengerAdd {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.integrations),
      variables: {
        kind: 'messenger'
      }
    },
    {
      query: gql(integrationQuery.integrationTotalCount)
    }
  ];
};

const WithQuery = compose(
  graphql<BrandsQueryResponse>(gql(integrationQuery.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(integrationQuery.integrationTotalCount), {
    name: 'totalCountQuery'
  })
)(MessengerAddContainer);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
