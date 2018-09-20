import * as React from 'react';
import { TabCaption, TabContainer } from './styles';

function Tabs(props: { children: React.ReactNode, grayBorder?: boolean }) {
  return <TabContainer {...props} />;
}

type TabTitleProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

function TabTitle(props: TabTitleProps) {
  return <TabCaption {...props} />;
}

export { Tabs, TabTitle };