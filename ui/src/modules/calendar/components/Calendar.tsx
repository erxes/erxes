import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import {
  CalendarContainer,
  CalendarWrapper,
  Cell,
  ColumnHeader,
  Day,
  Grid,
  Header,
  Presentation,
  Row,
  RowWrapper
} from '../styles';
import LeftSidebar from './LeftSidebar';

type State = {
  activeDate: Date;
  type: string;
};

class Calendar extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeDate: new Date(),
      type: ''
    };
  }

  getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const rows: Date[][] = [];
    let days: Date[] = [];
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0) {
      for (let i = dayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month, i * -1));
      }
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);

      if (date.getDay() === 0) {
        rows.push(days);
        days = [];
      }
    }

    if (days.length !== 0) {
      for (let i = 1; days.length < 7; i++) {
        days.push(new Date(year, month + 1, i));
      }

      rows.push(days);
    }

    return rows;
  };

  typeOnChange = item => {
    this.setState({ type: item.value });
  };

  dateOnChange = date => {
    this.setState({ activeDate: date });
  };

  renderHeader = () => {
    const weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Header>
        {weeks.map(week => {
          return (
            <ColumnHeader key={week}>
              <span>{week}</span>
            </ColumnHeader>
          );
        })}
      </Header>
    );
  };

  renderContent = () => {
    const { activeDate, type } = this.state;

    const rows = this.getDaysInMonth(
      activeDate.getMonth(),
      activeDate.getFullYear()
    );

    if (type === 'day') {
      return <div>day</div>;
    }

    if (type === 'week') {
      return <div>week</div>;
    }

    return (
      <Grid>
        {this.renderHeader()}
        <Presentation>
          {rows.map((days, index) => (
            <Row key={index}>
              <RowWrapper>
                {days.map((day, dayIndex) => (
                  <Cell key={dayIndex}>
                    <Day>{day.getDate()}</Day>
                  </Cell>
                ))}
              </RowWrapper>
            </Row>
          ))}
        </Presentation>
      </Grid>
    );
  };

  render() {
    return (
      <Wrapper
        header={<Wrapper.Header title="Calendar" />}
        leftSidebar={
          <LeftSidebar
            dateOnChange={this.dateOnChange}
            activeDate={this.state.activeDate}
            typeOnChange={this.typeOnChange}
            type={this.state.type}
          />
        }
        content={
          <CalendarContainer>
            <CalendarWrapper>{this.renderContent()}</CalendarWrapper>
          </CalendarContainer>
        }
        transparent={true}
      />
    );
  }
}

export default Calendar;
