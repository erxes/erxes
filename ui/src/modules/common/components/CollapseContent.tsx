import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '../styles/colors';
import Icon from './Icon';

const Title = styled.div`
  padding: 20px;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    font-weight: 500;
    margin: 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const Container = styledTS<{ open: boolean }>(styled.div)`
  margin-bottom: 10px;
  box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
  border-radius: 4px;
  background: ${props => (props.open ? colors.bgLight : colors.colorWhite)};

  ${Title} i {
    font-size: 20px;
    transition: transform ease 0.3s;
    transform: ${props => props.open && 'rotate(180deg)'};
  }
`;

const Content = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.borderPrimary};
  background: ${colors.colorWhite};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;

type Props = {
  title: string;
  children: React.ReactNode;
  open?: boolean;
};

function CollapseContent(props: Props) {
  const [open, toggleCollapse] = useState<boolean>(props.open || false);

  const onClick = () => toggleCollapse(!open);

  return (
    <Container open={open}>
      <Title onClick={onClick}>
        <h4>{props.title}</h4>
        <Icon icon="angle-down" />
      </Title>
      <Collapse in={open}>
        <div>
          <Content>{props.children}</Content>
        </div>
      </Collapse>
    </Container>
  );
}

export default CollapseContent;
