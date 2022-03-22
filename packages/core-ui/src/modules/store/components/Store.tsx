import React from 'react';
import Wrapper from '../containers/Wrapper';
import Leftbar from './Leftbar';
import Main from '../containers/Main';

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

class Store extends React.Component<Props, State> {

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
      <Wrapper
        leftSidebar={<Leftbar />}
        content={
          <Main />
        }
      />
    );
  }
}

export default Store;
