import { ButtonMutate, withProps } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../../graphql';
import {
  CloseInfoQueryResponse,
  CloseMutationResponse,
  CloseMutationVariables,
  IContract
} from '../../types';
import InterestChangeForm from '../../components/detail/InterestChangeForm';

type Props = {
  contract: IContract;
  closeModal: () => void;
  type: string;
};

type FinalProps = {
  closeInfoQuery: CloseInfoQueryResponse;
} & Props;

type State = {
  loading: boolean;
  invDate: Date;
};

class InterestChangeContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      invDate: new Date()
    };
  }

  render() {
    const { closeInfoQuery, contract } = this.props;

    const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      let mutation: any = undefined;

      switch (values.type) {
        case 'stopInterest':
          mutation = mutations.stopInterest;
          break;
        case 'interestChange':
          mutation = mutations.interestChange;
          break;
        case 'interestReturn':
          mutation = mutations.interestReturn;
          break;

        default:
          break;
      }

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully change interest this contract`)}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };

    const onChangeDate = (date: Date) => {
      this.setState(
        { invDate: date },
        () =>
          !this.props.type &&
          closeInfoQuery.refetch({
            date
          })
      );
    };

    if (closeInfoQuery?.loading) {
      return null;
    }

    const closeInfo = closeInfoQuery?.closeInfo || {};

    const updatedProps = {
      ...this.props,
      contract,
      renderButton,
      closeInfo,
      onChangeDate,
      invDate: this.state.invDate
    };

    return <InterestChangeForm {...updatedProps} />;
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
            contractId: contract?._id,
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
  )(InterestChangeContainer)
);
