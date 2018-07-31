import * as React from "react";
import { TopBar } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isExpanded?: boolean;
  onButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  onToggle?: () => void;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ endConversation, getColor }) => {
        return (
          <TopBar
            {...props}
            color={getColor()}
            isChat={Boolean(!connection.setting.email)}
            endConversation={endConversation}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
