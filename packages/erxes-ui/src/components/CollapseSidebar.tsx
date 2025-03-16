import React, { useEffect, useState } from "react";

import Icon from "./Icon";
import colors from "../styles/colors";
import { dimensions } from "../styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const Container = styledTS<{ collapsed?: boolean }>(styled.div)`
  width: ${(props) => (props.collapsed ? "60px" : "340px")};
  transition: width 0.3s ease;
  height: 100%; /* Adjust as per your needs */
  border-right: 1px solid ${colors.borderPrimary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styledTS<{ collapsed?: boolean }>(styled.div)`
  background: ${colors.bgLight};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreGray};
  display: flex;
  justify-content: ${(props) => (props.collapsed ? "center" : "space-between")};
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

const Title = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Content = styled.div`
  padding: ${dimensions.unitSpacing}px;
  flex: 1;
  overflow: auto;
`;

const IconWrapper = styled.div`
  cursor: pointer;
`;

type Props = {
  children: React.ReactNode;
  title: string;
  onToggle?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
};

const CollapsibleDiv = ({ children, title, onToggle, isCollapsed }: Props) => {
  const [collapsed, setCollapsed] = useState(isCollapsed || false);

  useEffect(() => {
    isCollapsed && setCollapsed(isCollapsed);
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    onToggle && onToggle(false);
  };

  return (
    <Container collapsed={collapsed}>
      <Header collapsed={collapsed}>
        <Title>{!collapsed && title}</Title>
        <IconWrapper onClick={toggleCollapse}>
          {collapsed ? (
            <Icon icon="arrow-to-right" size={20} />
          ) : (
            <Icon icon="left-arrow-to-left" size={20} />
          )}
        </IconWrapper>
      </Header>
      <Content>{collapsed ? null : children}</Content>
    </Container>
  );
};

export default CollapsibleDiv;
