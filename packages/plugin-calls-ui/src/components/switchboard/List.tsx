import React from 'react';
import { __ } from '@erxes/ui/src/utils';

import {
  Container,
  FlexWrap,
  SwitchboardRate,
  SwitchboardBox,
  SwitchboardPreview,
} from '../../styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles';

import { IQueue } from '../../types';
import { formatTime } from '../../utils';

const Circle = styled.circle`
  fill: transparent;
  stroke: hsla(225, 20%, 92%, 0.9);
  stroke-linecap: round;
`;

const FilledCircle: any = styledTS<{ color?: string }>(styled(Circle))`
  stroke: ${(props) => props.color};
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.5s ease-out;
`;

const Text = styled.div`
  align-items: center;
  display: flex;
  font-weight: bold;
  height: 100%;
  justify-content: center;
  left: 0;
  letter-spacing: 0.025em;
  position: absolute;
  margin-top: 10px;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 100;
`;
const Header = styledTS<{ fontSize?: string; bottomBorder?: boolean }>(
  styled.div,
)`
  ${(props) => !props.bottomBorder && 'padding-top: 20px;'}
  text-align: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${(props) => props.fontSize};
  
  ${(props) =>
    props.bottomBorder &&
    `
    &:after {
      content: '';
      width: 90%;
      margin: auto;
      height: 1px;
      background: #bfbfbf;
      display: block;
    }
  `}
`;
const Row = styledTS<{ fontSize?: string; bottomBorder?: boolean }>(styled.div)`
  text-align: center;
  font-weight: bold;
  justify-content: space-between;
  display: flex;
`;

const ContainerRow = styled.div`
  padding: 20px 0px 0px 30px;
  width: 90%;
`;

type IProps = {
  navigate: any;
  location: any;
  queueList: IQueue[];
};

const formatPercentage = (value: string): string => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00%';
  return `${num.toFixed(2)}%`;
};

function List(props: IProps) {
  const { navigate, queueList } = props;
  const progressBar = (
    percentage,
    color = colors.colorPrimary,
    height = '200px',
  ) => {
    const strokeWidth = 3;
    const radius = 100 / 2 - strokeWidth * 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <Container>
        <svg
          aria-valuemax={0}
          aria-valuemin={0}
          aria-valuenow={percentage}
          height={height}
          role="progressbar"
          width={height}
          viewBox="0 0 100 100"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Circle cx="50" cy="50" r={radius} strokeWidth={strokeWidth} />

          <FilledCircle
            color={'#00a854'}
            cx="50"
            cy="50"
            data-testid="progress-bar-bar"
            r={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeWidth={strokeWidth}
          />
        </svg>

        <SwitchboardRate color={'#4c84f3'}>
          {formatPercentage(percentage)}
        </SwitchboardRate>
        <Text>Answered Rate</Text>
      </Container>
    );
  };

  const onClick = (queue) =>
    queue && navigate && navigate(`/calls/switchboard/${queue}`);

  const renderList = (list) => {
    return (
      <SwitchboardBox key={list.queue} onClick={() => onClick(list.queue)}>
        <SwitchboardPreview>
          <Header fontSize="18px">{list.queue}</Header>
          <Header bottomBorder={true}>
            {progressBar(list.answered_rate, '#x', '200px')}
          </Header>
          <ContainerRow>
            <Row>
              <p>Total Calls:</p> <span> {list.total_calls}</span>
            </Row>
            <Row>
              <p>Answered Calls:</p> <span>{list.answered_calls}</span>
            </Row>
            <Row>
              <p> Abandoned Calls:</p> <span>{list.abandoned_calls}</span>
            </Row>
            <Row>
              <p>Average Wait time:</p> <span>{formatTime(list.avg_wait)}</span>
            </Row>
            <Row>
              <p>Average Talk time:</p>{' '}
              <span> {formatTime(list.avg_talk)}</span>
            </Row>
          </ContainerRow>
        </SwitchboardPreview>
      </SwitchboardBox>
    );
  };

  return <FlexWrap>{queueList.map((list) => renderList(list))}</FlexWrap>;
}

export default List;
