import { ButtonMutate, withProps } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { mutations } from '../../graphql';
import { IContract } from '../../types';
import ExpandForm from '../../components/detail/ExpandForm';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

type FinalProps = {} & Props;

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
    const { contract } = this.props;

    const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.expandContract}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully expand this contract`)}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };

    const updatedProps = {
      ...this.props,
      contract,
      renderButton
    };

    return <ExpandForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['savingsContractsMain', 'savingsContractDetail', 'savingsContracts'];
};

export default withProps<Props>(compose()(CloseFromContainer));
