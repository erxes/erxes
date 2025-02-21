import { TabCaption, TabContainer } from "./styles";

import React from "react";

function Tabs(props: {
  children: React.ReactNode;
  grayBorder?: boolean;
  full?: boolean;
  direction?: "horizontal" | "vertical";
}) {
  return (
    <TabContainer
      $grayBorder={props.grayBorder}
      $full={props.full}
      $direction={props.direction}
    >
      {props.children}
    </TabContainer>
  );
}

type TabTitleProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  direction?: "horizontal" | "vertical";
};

function TabTitle(props: TabTitleProps) {
  return <TabCaption {...props} />;
}

export { Tabs, TabTitle };
