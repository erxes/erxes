import { FlowRouter } from 'meteor/kadira:flow-router';


FlowRouter.route('/', {
  triggersEnter: [(context, redirect) => {
    redirect('/inbox');
  }],
});
