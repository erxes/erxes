import React from 'react';
import {storiesOf} from '@storybook/react';
import {withKnobs, text, select} from "@storybook/addon-knobs";
import Typography from "./Typography";
import Button from "../src/components/Button";

import User from "../src/components/User";

import Dropdown from "../src/components/Dropdown";

import Icon from '../src/components/Icon';
import 'ionicons/css/ionicons.min.css';

storiesOf('Typography', module).addDecorator(withKnobs).add("Primary", () => (<Typography/>));

storiesOf('Button', module).addDecorator(withKnobs).add("Primary", () => (
  <Button color={select("Color", [
    "primary", "default", "success"
  ], "default")}>
    {text("Text", "Hello Button")}
  </Button>
));

storiesOf('User', module).addDecorator(withKnobs).add('User', () => (
    <User
    text={text("Text", "John Walt")}
    img={text("Url", "http://www.imgworlds.com/wp-content/uploads/2015/12/18-CONTACTUS-HEADER.jpg")}
    arrow={select("Arrow", [
      "up", "down", "left", "right"
    ], "down")}>
    </User>
));

storiesOf('Dropdown', module).addDecorator(withKnobs).add('Dropdown', () => (
  <Dropdown item={(
    <Dropdown.Menu>
      <Dropdown.Item>123456123</Dropdown.Item>
      <Dropdown.Item divider>123456123</Dropdown.Item>
    </Dropdown.Menu>
  )}>
    <Button>12312313</Button>
  </Dropdown>
));

storiesOf('Icon', module).addDecorator(withKnobs).add('Icon', () => (
  <Icon icon="arrow-left-a"></Icon>
));
