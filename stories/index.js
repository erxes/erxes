import React from 'react';
import {storiesOf} from '@storybook/react';
import {withKnobs, text, select} from "@storybook/addon-knobs";
import Typography from "./Typography";
import Button from "../src/components/Button";

import Header from "../src/components/Header";
import HeaderUser from "../src/components/Header/user";

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

storiesOf('Header', module).addDecorator(withKnobs).add('Header', () => (
  <Header>{text("Text", 'Homepage')}
    <HeaderUser>{text("lastName", 'lastName')}{text("firstName", 'firstName')}</HeaderUser>
  </Header>
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
