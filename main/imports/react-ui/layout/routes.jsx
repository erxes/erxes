import React from 'react';
import { mount } from 'react-mounter';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AuthLayout, NotificationList, MainLayout } from './containers';
import NotFound from './components/NotFound.jsx';


const publicRoutes = [
  'auth/signUp',
  'auth/signIn',
  'auth/forgotPassword',
  'auth/resetPassword',
];

function checkAuthentication(context, redirect) {
  if (!Meteor.userId()) {
    redirect('auth/signIn');
  }
}

FlowRouter.triggers.enter([checkAuthentication], { except: publicRoutes });


FlowRouter.notFound = {
  action: () => {
    mount(AuthLayout, { content: <NotFound /> });
  },
};

FlowRouter.route('/notifications', {
  action() {
    mount(MainLayout, { content: <NotificationList /> });
  },
  name: 'notifications',
});
