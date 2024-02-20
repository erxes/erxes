import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

import { Loader } from '@erxes/ui/src/styles/main';

import { FlexRow } from '../../styles';

const Label = styledTS<{ width?: number }>(styled(Loader))`
  width: ${(props) => props.width}%;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
`;

const Input = styled(Loader)`
  width: 15px;
  height: 15px;
  border-radius: 2px;
  flex-shrink: 0;
`;

const MainContent = styled.ul`
  height: 88px;
  transition: 0.5s ease;
  overflow: hidden;
  margin: unset;
  padding: unset;
  width: 100%;
`;

const Row = styled(FlexRow)`
  margin-bottom: 7px;
`;

const ChartLoader = (props: {}) => {
  return (
    <MainContent>
      {[1, 2, 3, 4].map((index) => {
        const labelWidth = Math.floor(Math.random() * (80 - 30 + 1)) + 30;

        return (
          <Row key={index}>
            <Label width={labelWidth} />
            <Input />
          </Row>
        );
      })}
    </MainContent>
  );
};

export default ChartLoader;
