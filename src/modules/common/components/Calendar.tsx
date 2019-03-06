import * as moment from 'moment';
import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import { __ } from '../utils';
import {
  getCurrentMonth,
  getMonthYear,
  nextMonth,
  onMonthChange,
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

const Card = styled.div`
  border-radius: 10px;
  background: ${colors.colorCoreLightGray};
  height: 150px;
  width: auto;
  margin: 20px;
`;

const Item = styled.div`
  margin: 8px;
`;

const Title = styled.div`
  margin: 8px;
  text-transform: uppercase;
`;

const Content = styled.div`
  flex: 0.25;
  overflow: hidden;
  border-right: 0.5px solid ${colors.borderPrimary};
  border-left: 0.5px solid ${colors.borderPrimary};
`;

const ContentHeader = styled.div`
  background: ${colors.bgLight};
  padding: 8px;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const ContentBody = styled.div`
  height: 100%;
  overflow-y: auto;
  padding-bottom: 40px;
`;

type State = {
  currentMonth: moment.Moment;
};

type IDateColumn = {
  month: number;
  year: number;
  title: string;
};

type IButton = {
  icon?: string;
  text?: string;
  onClick: () => void;
};

class Calendar extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = { currentMonth: getCurrentMonth() };
  }

  onPreviousClick = () => {
    const currentMonth = previousMonth(this.state.currentMonth);

    this.setState({ currentMonth });
  };

  onNextClick = () => {
    const currentMonth = nextMonth(this.state.currentMonth);

    this.setState({ currentMonth });
  };

  setCurrentMonth = () => {
    this.setState({ currentMonth: getCurrentMonth() });
  };

  renderTitle(title: string) {
    return (
      <HeaderWrapper>
        {renderButton({ icon: 'leftarrow', onClick: this.onPreviousClick })}
        {renderButton({ icon: 'rightarrow', onClick: this.onNextClick })}
        {renderButton({ onClick: this.setCurrentMonth, text: 'Today' })}
        <Title>{title}</Title>
      </HeaderWrapper>
    );
  }

  renderContent() {
    const { currentMonth } = this.state;
    const months = onMonthChange(currentMonth);

    const contents = months.map((date: IDateColumn, index: number) => (
      <Content key={index}>
        <ContentHeader>
          <h5>{date.title}</h5>
        </ContentHeader>
        <ContentBody />
      </Content>
    ));

    return contents;
  }

  render() {
    const { currentMonth } = this.state;
    const { title } = getMonthYear(currentMonth, true);

    return (
      <Container>
        <Header>{this.renderTitle(title)}</Header>
        <Body>{this.renderContent()}</Body>
      </Container>
    );
  }
}

function renderButton(props: IButton) {
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
