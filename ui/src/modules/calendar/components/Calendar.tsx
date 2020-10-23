import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Event from '../containers/Event';
import { MainContainer } from '../styles';
import LeftSidebar from './LeftSidebar';

type State = {
  currentDate: Date;
  type: string;
};

class Calendar extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      type: 'month'
    };
  }

  typeOnChange = item => {
    this.setState({ type: item.value });
  };

  dateOnChange = date => {
    this.setState({ currentDate: date });
  };

  render() {
    const { type, currentDate } = this.state;

    return (
      <Wrapper
        header={<Wrapper.Header title="Calendar" />}
        leftSidebar={
          <LeftSidebar
            dateOnChange={this.dateOnChange}
            currentDate={currentDate}
            typeOnChange={this.typeOnChange}
            type={type}
          />
        }
        content={
          <>
            <MainContainer>
              <Event type={type} currentDate={currentDate} />
            </MainContainer>
          </>
        }
        transparent={true}
      />
    );
  }
}

export default Calendar;
