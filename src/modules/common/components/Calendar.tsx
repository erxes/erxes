import { BarItems } from 'modules/layout/styles';
import * as moment from 'moment';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import { DropdownToggle } from '.';
import { colors } from '../styles';
import { IDateColumn } from '../types';
import { __ } from '../utils';
import {
  getCurrentDate,
  getFullTitle,
  getMonthTitle,
  monthColumns,
  nextMonth,
  previousMonth
} from '../utils/calendar';
import Button from './Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

const Header = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  border-bottom: 0.5px solid ${colors.borderPrimary};
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Body = styled.div`
  flex: 10;
  display: flex;
  flex-direction: row;
  max-height: 100%;
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  border-right: 0.5px solid ${colors.borderPrimary};
  border-left: 0.5px solid ${colors.borderPrimary};
`;

const ContentHeader = styled.div`
  background: ${colors.bgLight};
  padding: 8px;
  text-align: center;
  font-size: 14px;
`;

const Item = styled.div`
  margin: 8px;
`;

const Title = styled.div`
  margin: 8px;
  text-transform: uppercase;
`;

type State = {
  currentDate: moment.Moment;
  column: number;
};

type ItemButton = {
  icon?: string;
  text?: string;
  onClick: () => void;
};

type Props = {
  renderColumn: (date: IDateColumn) => React.ReactNode;
};

const columns = [3, 4, 5];

class Calendar extends React.Component<Props, State> {
  state = {
    currentDate: getCurrentDate(),
    column: 3
  };

  onPreviousClick = () => {
    const currentDate = previousMonth(this.state.currentDate);

    this.setState({ currentDate });
  };

  onNextClick = () => {
    const currentDate = nextMonth(this.state.currentDate);

    this.setState({ currentDate });
  };

  setCurrentDate = () => {
    this.setState({ currentDate: getCurrentDate() });
  };

  setColumn = (column: number) => {
    this.setState({ column });
  };

  renderColumnTypes() {
    return columns.map((column, index) => (
      <li key={index}>
        <span onClick={this.setColumn.bind(this, column)}>
          {column} {__('columns')}
        </span>
      </li>
    ));
  }

  renderLeftItem(title: string) {
    return (
      <HeaderWrapper>
        {renderButton({ icon: 'leftarrow', onClick: this.onPreviousClick })}
        {renderButton({ icon: 'rightarrow', onClick: this.onNextClick })}
        {renderButton({ onClick: this.setCurrentDate, text: 'Today' })}
        <Title>{title}</Title>
      </HeaderWrapper>
    );
  }

  renderRightItem() {
    return (
      <BarItems>
        <Dropdown id="dropdown-columns">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="primary" icon="downarrow" ignoreTrans={true}>
              {__('Columns')}
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>{this.renderColumnTypes()}</Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );
  }

  renderContent() {
    const { currentDate, column } = this.state;
    const months = monthColumns(currentDate, column);

    return months.map((date: IDateColumn, index: number) => {
      const title = getMonthTitle(date.month);
      return this.renderColumns(index, title, date);
    });
  }

  renderColumns(index: number, title: string, date: IDateColumn) {
    return (
      <Content key={index}>
        <ContentHeader>{title}</ContentHeader>
        {this.props.renderColumn(date)}
      </Content>
    );
  }

  render() {
    const title = getFullTitle(this.state.currentDate);

    return (
      <Container>
        <Header>
          {this.renderLeftItem(title)}
          {this.renderRightItem()}
        </Header>
        <Body>{this.renderContent()}</Body>
      </Container>
    );
  }
}

function renderButton(props: ItemButton) {
  const { text, ...buttonProps } = props;

  return (
    <Item>
      <Button
        btnStyle="primary"
        ignoreTrans={true}
        size="small"
        {...buttonProps}
      >
        {text && __(text)}
      </Button>
    </Item>
  );
}

export default Calendar;
