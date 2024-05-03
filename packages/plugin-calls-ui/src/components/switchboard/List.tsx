import React, { useEffect, useState } from 'react';
import { __, router } from '@erxes/ui/src/utils';

import Button from '@erxes/ui/src/components/Button';
import { Container, FlexWrap, PreviewContent, SiteBox, SitePreview } from '../../styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

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
  margin-bottom: 1rem;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 100;
`;

function List() {

  useEffect(() => {
   
  }, []);

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

const progressBar = (
  percentage,
  color = '#dddeff',
  height ='300px',
)=> {
    const strokeWidth = 3;
    const radius = 100 / 2 - strokeWidth * 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <Container>
        <svg
          aria-valuemax={100}
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

        <Text color={color} data-testid="progress-bar-text">
          <span>abandonedRate {percentage}%</span>
        </Text>
      </Container>
    );
 
}

 const renderList =(list)=> {
    // const { remove, duplicate } = this.props;

    return (
      <SiteBox key={list._id}>
        <SitePreview>
          <div style={{ textAlign: 'center' }}>
            <b>{list.name}</b>
            <br />
            {progressBar(list.abnormalPercentage, '#dddeff', '300px')}
            <br />
            
          </div>

          <PreviewContent>
            <Button
              btnStyle="white"
              //   onClick={() => this.showSite(list)}
              icon="eye"
            >
              {__('View site')}
            </Button>
            {/* {this.renderEditAction(list)} */}
          </PreviewContent>
        </SitePreview>
        {/* <Content>
          <div>
            <b>{site.name}</b>
            <span>{site.domain || __("View site")}</span>
          </div>
          <Dropdown
            as={DropdownToggle}
            toggleComponent={<Icon icon="ellipsis-h" size={18} />}
          >
            <a href={`/xbuilder/sites/edit/${site._id}`}>
              <li key="editor">
                <Icon icon="edit-3" /> {__("Editor")}
              </li>
            </a>
            <li key="duplicate" onClick={() => duplicate(site._id)}>
              <Icon icon="copy" /> {__("Duplicate")}
            </li>
            <li key="delete" onClick={() => remove(site._id)}>
              <Icon icon="trash-alt" size={14} /> {__("Delete")}
            </li>
          </Dropdown>
        </Content> */}
      </SiteBox>
    );
  }

  return (
//    <div>{lists.map((list)=>{
    // return <p>{list.name}</p>
     <FlexWrap>{lists.map((site) => renderList(site))}</FlexWrap>
//    })}</div>
  );
}

export default List;
