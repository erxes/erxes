import * as React from "react";
import { Callout } from "../components";
import { AppConsumer } from "./AppContext";

const container = () => (
  <AppConsumer>
    {({ showForm, setHeight, getForm }) => {
      const form = getForm();
      const { callout, themeColor } = form;

      return (
        <Callout
          onSubmit={showForm}
          setHeight={setHeight}
          configs={callout || {}}
          color={themeColor || ""}
          hasTopBar={true}
        />
      );
    }}
  </AppConsumer>
);

export default container;
