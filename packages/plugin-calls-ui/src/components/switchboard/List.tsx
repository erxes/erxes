import React, { useEffect, useState } from 'react';
import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import {
  Container,
  FlexWrap,
  PreviewContent,
  SwitchboardRate,
  SwitchboardBox,
  SwitchboardPreview,
} from '../../styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '@erxes/ui/src/styles';

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

const Text = styledTS<{ color?: string }>(styled.div)`
  align-items: center;
  color: ${(props) => props.color};
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
  ${(props) =>
    !props.bottomBorder && 'padding-top: 20px;'}
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
const Row = styledTS<{ fontSize?: string; bottomBorder?: boolean }>(
  styled.div,
)`
  text-align: center;
  font-weight: bold;
  justify-content: space-between;
  display: flex;
`;

const ContainerRow = 
  styled.div
`
  padding: 20px 0px 0px 30px;
  width: 90%;
`;

function List() {
  useEffect(() => {}, []);

  const lists = [
    {
      name: '6500',
      abnormalPercentage: '54',
      Members: 3,
      TotalCalls: 550,
      AnsweredCalls: 392,
      WaitingCalls: 0,
      AbandonedCalls: 158,
      AverageWaitTime: '00:00:13',
      AverageTalkTime: '00:02:52',
    },
    {
      name: 'Company123',
      abnormalPercentage: 78,
      Members: 5,
      TotalCalls: 720,
      AnsweredCalls: 520,
      WaitingCalls: 20,
      AbandonedCalls: 200,
      AverageWaitTime: '00:01:35',
      AverageTalkTime: '00:03:20',
    },
    {
      name: 'Company456',
      abnormalPercentage: 32,
      Members: 8,
      TotalCalls: 880,
      AnsweredCalls: 620,
      WaitingCalls: 50,
      AbandonedCalls: 260,
      AverageWaitTime: '00:00:50',
      AverageTalkTime: '00:03:10',
    },
    {
      name: 'Company789',
      abnormalPercentage: 90,
      Members: 2,
      TotalCalls: 350,
      AnsweredCalls: 240,
      WaitingCalls: 10,
      AbandonedCalls: 110,
      AverageWaitTime: '00:02:10',
      AverageTalkTime: '00:04:05',
    },
  ];

  const progressBar = (percentage, color = colors.colorPrimary, height = '200px') => {
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
            color={color}
            cx="50"
            cy="50"
            data-testid="progress-bar-bar"
            r={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeWidth={strokeWidth}
          />
        </svg>

        <SwitchboardRate color={'#3FBD68'}>{percentage}% </SwitchboardRate>
        <Text>Abandoned Rate</Text>
      </Container>
    );
  };

  const renderList = (list) => {
    // const { remove, duplicate } = this.props;

    return (
      <SwitchboardBox
        key={list._id}
        onClick={() => `/calls/switchboard/detail?${list._id}`}
      >
        <SwitchboardPreview>
          <Header fontSize="18px">{list.name}</Header>
          <Header bottomBorder={true}>
            {progressBar(list.abnormalPercentage, '#dddeff', '200px')}
          </Header>
          <ContainerRow>
            <Row>
              <p>Members:</p> <span>{list.Members}</span>
            </Row>
            <Row>
              <p>Total Calls:</p> <span> {list.TotalCalls}</span>
            </Row>
            <Row>
              <p>Answered Calls:</p> <span>{list.AnsweredCalls}</span>
            </Row>
            <Row>
              <p> Waiting Calls:</p> <span> {list.WaitingCalls}</span>
            </Row>
            <Row>
              <p> Abandoned Calls:</p> <span>{list.AbandonedCalls}</span>
            </Row>
            <Row>
              <p>Average Wait time:</p> <span>{list.AverageWaitTime}</span>
            </Row>
            <Row>
              <p>Average Talk time:</p> <span> {list.AverageTalkTime}</span>
            </Row>
          </ContainerRow>
        </SwitchboardPreview>
      </SwitchboardBox>
    );
  };

  return (
    //    <div>{lists.map((list)=>{
    // return <p>{list.name}</p>
    <FlexWrap>{lists.map((site) => renderList(site))}</FlexWrap>
    //    })}</div>
  );
}

export default List;
