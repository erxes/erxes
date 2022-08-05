import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Plugin chat" */ './containers/Home')
);

const Chat = () => <Route path="/erxes-plugin-chat/home" component={Home} />;

export default Chat;
