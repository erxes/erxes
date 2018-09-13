import * as React from 'react';
import { TabCaption, TabContainer } from './styles';

function Tabs(props: Props) {
  return <TabContainer {...props} />;
}

function TabTitle(props: TabTitleProps) {
  return <TabCaption {...props} />;
}

type Props= {
  children: React.ReactNode,
  grayBorder?: boolean
};

type TabTitleProps = {
  children: React.ReactNode,
  onClick?: () => void,
  className?: string
};

export { Tabs, TabTitle };
