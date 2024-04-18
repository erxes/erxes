import { ButtonMutate, withProps } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import BlockForm from '../../components/detail/BlockForm';
import { mutations } from '../../graphql';
import {
  CloseMutationResponse,
  CloseMutationVariables,
  IContract
} from '../../types';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

type State = {
  loading: boolean;
  closeDate: Date;
};

class CloseFromContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      closeDate: new Date()
    };
  }

  render() {
    const { contract } = this.props;

    const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.savingsBlockAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully closed this contract`)}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };

    const onChangeDate = (date: Date) => {
      this.setState({ closeDate: date });
    };

    const updatedProps = {
      ...this.props,
      contract,
      renderButton,
      onChangeDate,
      closeDate: this.state.closeDate
    };

    return <BlockForm {...updatedProps} />;
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
    graphql<{}, CloseMutationResponse, CloseMutationVariables>(
      gql(mutations.savingsBlockAdd),
      {
        name: 'savingsBlockAdd'
      }
    )
  )(CloseFromContainer)
);
