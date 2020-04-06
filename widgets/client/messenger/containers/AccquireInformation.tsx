import * as React from "react";
import { AccquireInformation } from "../components";
import { AppConsumer } from "./AppContext";

export default class extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ saveGetNotified, getColor, isSavingNotified }) => {
          return (
            <AccquireInformation
              color={getColor()}
              save={saveGetNotified}
              loading={isSavingNotified}
              showTitle={true}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
