import { Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';

const StyledRow = styled(Row)`
  padding: 20px 20px 10px 20px;
  background: white;
  display: flex;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 24px;
    line-height: 30px;
    font-weight: 400;
  }
`;

const ButtonsCol = styled(Col)`
  text-align: right;
`;

const PageHeader = ({ title, button }: { title: any; button: any }) => (
  <StyledRow>
    <Col span={12}>{title}</Col>
    <ButtonsCol span={12}>{button}</ButtonsCol>
  </StyledRow>
);

export default PageHeader;
