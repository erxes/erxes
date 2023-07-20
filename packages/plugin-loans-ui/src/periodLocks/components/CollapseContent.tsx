import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import colors from '@erxes/ui/src/styles/colors';
import Icon from '@erxes/ui/src/components/Icon';

const Container = styledTS<{ open: boolean }>(styled.div)`
  margin-bottom: 10px;
  box-shadow: 0 0 6px 1px rgba(0,0,0,0.08);
  border-radius: 4px;
  background: ${props => (props.open ? colors.bgLight : colors.colorWhite)};

  &:last-child {
    margin-bottom: 0;
  }
`;

const Content = styledTS<{ full: boolean }>(styled.div)`
  padding: ${props => (props.full ? '0' : '20px')};
  border-top: 1px solid ${colors.borderPrimary};
  background: ${colors.colorWhite};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;

  ${Container} {
    box-shadow: none;
    border-radius: 0;
    background: ${colors.colorWhite};
    border-bottom: 1px solid ${colors.borderPrimary};
    margin: 0;
  }
`;

type Props = {
  contendId?: string;
  title?: string;
  children: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  compact?: boolean;
  image?: string;
  beforeTitle?: React.ReactNode;
  onClick?: () => void;
  imageBackground?: string;
  id?: string;
  full?: boolean;
  content?: React.ReactNode;
  containerParent?: React.ReactNode;
};

function CollapseContent(props: Props) {
  const [open, toggleCollapse] = useState<boolean>(props.open || false);

  const onClick = () => {
    toggleCollapse(!open);
    if (props.onClick) {
      props.onClick();
    }
  };
  const hasImage = props.image ? true : false;
  if (props.containerParent) {
    return (
      <React.Fragment>
        {React.cloneElement(props.children, { onClick })}
        <props.containerParent>
          <Container open={open} id={props.id} style={{ width: '100%' }}>
            <Collapse in={open}>
              <Content
                full={hasImage || props.full || false}
                style={{ padding: 10 }}
              >
                {props.content || props.children}
              </Content>
            </Collapse>
          </Container>
        </props.containerParent>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {React.cloneElement(props.children, { onClick })}

      <Container open={open} id={props.id} style={{ width: '100%' }}>
        <Collapse in={open}>
          <div>
            <Content full={hasImage || props.full || false}>
              {props.content || props.children}
            </Content>
          </div>
        </Collapse>
      </Container>
    </React.Fragment>
  );
}

export default CollapseContent;
