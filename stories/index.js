import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select } from "@storybook/addon-knobs";

import Typography from "./Typography";
import Button from "../src/components/Button";

storiesOf('Typography', module)
  .addDecorator(withKnobs)
  .add("Primary", () => (
    <Typography />
  ));


storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add("Primary", () => (
    <Button
      color={select("Color", ["primary", "default", "success"], "default")}
    >
      {text("Text", "Hello Button")}
    </Button>
  ));
