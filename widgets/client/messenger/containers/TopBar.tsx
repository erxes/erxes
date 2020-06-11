import * as React from "react";
import { TopBar } from "../components";
import { connection } from "../connection";
import { AppConsumer } from "./AppContext";

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isExpanded?: boolean;
  onLeftButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  toggleHead?: () => void;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ endConversation, getColor, toggle, setHeadHeight, headHeight }) => {
        return (
          <TopBar
            {...props}
            color={getColor()}
            toggleLauncher={toggle}
            isChat={Boolean(!connection.setting.email)}
            endConversation={endConversation}
            prevHeight={headHeight}
            setHeadHeight={setHeadHeight}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
