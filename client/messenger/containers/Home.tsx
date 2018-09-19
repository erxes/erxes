import * as React from "react";
import { IUser } from "../../types";
import { Home as WidgetHome } from "../components";
import { AppConsumer } from "./AppContext";

type Props = {
  supporters: IUser[];
};

const home = (props: Props) => (
  <AppConsumer>
    {({ changeRoute }) => {
      const createConversation = () => {
        changeRoute("conversationCreate");
      };

      return <WidgetHome {...props} createConversation={createConversation} />;
    }}
  </AppConsumer>
);

export default home;
