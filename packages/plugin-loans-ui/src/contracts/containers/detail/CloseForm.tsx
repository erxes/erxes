import { __, ButtonMutate, withProps } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import CloseForm from '../../components/detail/CloseForm';
import { mutations, queries } from '../../graphql';
import {
  CloseInfoQueryResponse,
  CloseMutationResponse,
  CloseMutationVariables,
  IContract
} from '../../types';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

type FinalProps = {
  closeInfoQuery: CloseInfoQueryResponse;
} & Props;

type State = {
  loading: boolean;
  closeDate: Date;
};

class CloseFromContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      closeDate: new Date()
    };
  }

  render() {
    const { closeInfoQuery, contract } = this.props;

    const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.contractsClose}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully closed this contract`)}
        />
      );
    };

    const onChangeDate = (date: Date) => {
      this.setState({ closeDate: date }, () =>
        closeInfoQuery.refetch({
          date
        })
      );
    };

    if (closeInfoQuery.loading) {
      return null;
    }

    const closeInfo = closeInfoQuery.closeInfo || {};

    const updatedProps = {
      ...this.props,
      contract,
      renderButton,
      closeInfo,
      onChangeDate,
      closeDate: this.state.closeDate
    };

    return <CloseForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'contractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, CloseInfoQueryResponse, { contractId: string; date: Date }>(
      gql(queries.closeInfo),
      {
        name: 'closeInfoQuery',
        options: ({ contract }) => ({
          variables: {
            contractId: contract._id,
            date: new Date()
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, CloseMutationResponse, CloseMutationVariables>(
      gql(mutations.contractsClose),
      {
        name: 'contractsClose'
      }
    )
  )(CloseFromContainer)
);
