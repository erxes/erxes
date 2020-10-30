import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Event from '../containers/Event';
import LeftSidebar from '../containers/Sidebar';
import { MainContainer } from '../styles';
import { TYPES } from '../constants';
import { generateFilters } from '../utils';

type Props = {
  integrationId?: string;
  history: any;
  queryParams: any;
};

type State = {
  currentDate: Date;
  type: string;
};

class Calendar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentDate: new Date(),
      type: TYPES.MONTH
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
    const { integrationId, history, queryParams } = this.props;

    if (!integrationId) {
      return <div>Connect calendar</div>;
    }

    return (
      <Wrapper
        header={<Wrapper.Header title="Calendar" />}
        leftSidebar={
          <LeftSidebar
            dateOnChange={this.dateOnChange}
            currentDate={currentDate}
            typeOnChange={this.typeOnChange}
            type={type}
            integrationId={integrationId}
            history={history}
            queryParams={queryParams}
            {...generateFilters(currentDate, type)}
          />
        }
        content={
          <>
            <MainContainer>
              <Event
                {...generateFilters(currentDate, type)}
                type={type}
                currentDate={currentDate}
                integrationId={integrationId}
                queryParams={queryParams}
              />
            </MainContainer>
          </>
        }
        transparent={true}
      />
    );
  }
}

export default Calendar;
