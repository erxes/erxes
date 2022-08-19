import * as React from "react";
import { IUser } from "../../types";
import WidgetHome from "../components/Home";
import { AppConsumer } from "./AppContext";

type Props = {
  supporters: IUser[];
  color?: string;
  isOnline?: boolean;
  activeSupport?: boolean;
};

const home = (props: Props) => (
  <AppConsumer>
    {({ getColor, getMessengerData }) => {
      return (
        <WidgetHome
          {...props}
          messengerData={getMessengerData()}
          color={getColor()}
        />
      );
    }}
  </AppConsumer>
);

export default home;
