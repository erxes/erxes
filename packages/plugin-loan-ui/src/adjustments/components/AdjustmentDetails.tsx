import dayjs from 'dayjs';
import { __, Wrapper } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import { IAdjustmentDetail } from '../types';
import DetailInfo from './AdjustmentDetailInfo';

type Props = {
  adjustment: IAdjustmentDetail;
  currentUser: IUser;
  saveItem: (doc: IAdjustmentDetail, callback?: (item) => void) => void;
};

type State = {};

class ContractDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const adjustment = props.adjustment;

    this.state = {};
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { adjustment, saveItem } = this.props;

    const title =
      dayjs(adjustment.date)
        .format('ll')
        .toString() || 'Unknown';

    const breadcrumb = [
      { title: __('Adjustments'), link: '/erxes-plugin-loan/adjustment-list' },
      { title }
    ];

    const content = () => {
      return <></>;
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
