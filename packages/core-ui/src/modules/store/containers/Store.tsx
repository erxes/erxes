import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import {Wrapper} from '@erxes/ui/src/styles/main';
import Bulk from '@erxes/ui/src/components/Bulk';
import Store from '../components/Store';

type Props = {
    text: string;
//   currentDate: Date;
//   type: string;
//   events: IEvent[];
//   startTime: Date;
//   endTime: Date;
//   queryParams: any;
//   remove: (_id: string, accountId: string) => void;
//   onDayClick: (date) => void;
};

type State = {
    count : number;
//   isPopupVisible: boolean;
//   selectedDate?: Date;
//   event?: IEvent;
//   account?: IAccount;
//   cellHeight: number;
};

class StoreContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
        count: 0
    //   isPopupVisible: false,
    //   selectedDate: new Date(),
    //   cellHeight: 0
    };
  }

  render() {
    return (
      <Store text={this.props.text} />
    );
  }
}

export default StoreContainer;
