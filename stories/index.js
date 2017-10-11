import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select } from "@storybook/addon-knobs";

import Button from "../src/components/Button";

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add("Primary", () => (
    <Button
      color={select("Color", ["primary", "default", "success"], "default")}
    >
      {text("Text", "Hello Button")}
    </Button>
  ));
