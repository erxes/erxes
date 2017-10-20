import React from 'react';
import { mount } from 'react-mounter';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AuthLayout } from '../layout/containers';
import {
  // SignUpContainer,
  SignInContainer,
  ForgotPasswordContainer,
  ResetPasswordContainer
} from './containers';

function checkAuth(context, redirect) {
  if (Meteor.userId()) {
    redirect('/');
  }
}

// TEMPORARY DISABLED
//
// FlowRouter.route('/sign-up', {
//   name: 'auth/signUp',
//   triggersEnter: [checkAuth],
//   action() {
//     mount(AuthLayout, { content: <SignUpContainer /> });
//   },
// });

FlowRouter.route('/sign-in', {
  name: 'auth/signIn',
  triggersEnter: [checkAuth],
  action() {
    mount(AuthLayout, { content: <SignInContainer /> });
  }
});

FlowRouter.route('/forgot-password', {
  name: 'auth/forgotPassword',
  triggersEnter: [checkAuth],
  action() {
    mount(AuthLayout, { content: <ForgotPasswordContainer /> });
  }
});

FlowRouter.route('/reset-password/:token', {
  name: 'auth/resetPassword',
  triggersEnter: [checkAuth],
  action(params) {
    mount(AuthLayout, {
      content: <ResetPasswordContainer token={params.token} />
    });
  }
});

FlowRouter.route('/logout', {
  name: 'auth/logout',
  action() {
    Meteor.logout(() => {
      FlowRouter.go('/');
    });
  }
});
