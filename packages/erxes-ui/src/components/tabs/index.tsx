import { TabCaption, TabContainer } from "./styles";

import React from "react";

function Tabs(props: {
  children: React.ReactNode;
  grayBorder?: boolean;
  full?: boolean;
}) {
  return (
    <TabContainer $grayBorder={props.grayBorder} $full={props.full}>
      {props.children}
    </TabContainer>
  );
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
