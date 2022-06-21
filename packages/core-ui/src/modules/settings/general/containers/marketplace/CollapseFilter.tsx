import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '@erxes/ui/src/styles/colors';
import Icon from '@erxes/ui/src/components/Icon';
import { dimensions } from '@erxes/ui/src/styles';
import { FlexContent } from '@erxes/ui/src/activityLogs/styles';

const Title = styledTS<{
  hasImage?: boolean;
  background?: string;
}>(styled.a)`
  padding: ${dimensions.unitSpacing}px;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  color: ${colors.textSecondary};

  h4 {
    font-weight: 500;
    margin: 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const Container = styledTS<{ open: boolean; border?: boolean }>(styled.div)`
  background: ${colors.colorWhite};
  padding: ${dimensions.unitSpacing};
  border-top: 1px solid ${props =>
    props.border ? colors.borderPrimary : colors.colorWhite};

  &:last-child {
    margin-bottom: 0;
  }

  > ${Title} i {
    font-size: 20px;
    transition: transform ease 0.3s;
    transform: ${props => props.open && 'rotate(180deg)'};
  }
`;

const Content = styled.div`
  background: ${colors.colorWhite};
  padding: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px;

  ${Container} {
    background: ${colors.colorWhite};
    margin: 0;
  }
`;

type Props = {
  contendId?: string;
  title: string;
  children: React.ReactNode;
  open?: boolean;
  onClick?: () => void;
  id?: string;
  hasBorder?: boolean;
};

function CollapseFilter(props: Props) {
  const [open, toggleCollapse] = useState<boolean>(props.open || false);

  const onClick = () => {
    toggleCollapse(!open);
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <Container open={open} id={props.id} border={props.hasBorder}>
      <Title
        href={props.contendId && `#${props.contendId}`}
        id={props.contendId}
        onClick={onClick}
      >
        <FlexContent>
          <b>{props.title}</b>
        </FlexContent>
        <Icon icon="angle-down" />
      </Title>
      <Collapse in={open}>
        <Content>{props.children}</Content>
      </Collapse>
    </Container>
  );
}

export default CollapseFilter;
