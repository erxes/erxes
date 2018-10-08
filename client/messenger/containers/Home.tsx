import * as React from "react";
import { IUser } from "../../types";
import { Home as WidgetHome } from "../components";
import { AppConsumer } from "./AppContext";

type Props = {
  supporters: IUser[];
  color: string;
};

const home = (props: Props) => (
  <AppConsumer>
    {({ getColor }) => {
      return <WidgetHome {...props} color={getColor()} />;
    }}
  </AppConsumer>
);

export default home;
