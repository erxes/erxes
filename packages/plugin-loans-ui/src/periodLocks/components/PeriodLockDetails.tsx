import dayjs from 'dayjs';
import { __, Wrapper } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';

import { IPeriodLockDetail } from '../types';
import DetailInfo from './PeriodLockDetailInfo';

type Props = {
  periodLock: IPeriodLockDetail;
  currentUser: IUser;
  saveItem: (doc: IPeriodLockDetail, callback?: (item) => void) => void;
};

type State = {};

class ContractDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const periodLock = props.periodLock;

    this.state = {};
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { periodLock, saveItem } = this.props;

    const title =
      dayjs(periodLock.date)
        .format('ll')
        .toString() || 'Unknown';

    const breadcrumb = [
      { title: __('PeriodLocks'), link: '/erxes-plugin-loan/periodLock-list' },
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
