import * as React from "react";
import { TopBar } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isExpanded?: boolean;
  isBig: boolean;
  onButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  onToggle?: () => void;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ endConversation, getColor, toggle }) => {
        return (
          <TopBar
            {...props}
            color={getColor()}
            toggleLauncher={toggle}
            isChat={Boolean(!connection.setting.email)}
            endConversation={endConversation}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
