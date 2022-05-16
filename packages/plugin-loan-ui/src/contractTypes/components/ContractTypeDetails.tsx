import { __, Wrapper } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import { IContractTypeDetail } from '../types';
import DetailInfo from './ContractTypeDetailInfo';
import JournalsSettings from './JournalsSettings';

type Props = {
  contractType: IContractTypeDetail;
  currentUser: IUser;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

type State = {};

class ContractDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const contractType = props.contractType;

    this.state = {};
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { contractType, saveItem } = this.props;

    const title = contractType.name || 'Unknown';

    const breadcrumb = [
      {
        title: __('Contract types'),
        link: '/contract-types'
      },
      { title }
    ];

    const content = () => {
      return (
        <JournalsSettings contractType={contractType} saveItem={saveItem} />
      );
    };

    return (
      <Wrapper
        header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
        leftSidebar={<DetailInfo {...this.props} />}
        content={content()}
        transparent={true}
      />
    );
  }
}

export default ContractDetails;
