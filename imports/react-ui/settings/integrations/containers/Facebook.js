import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import Alert from 'meteor/erxes-notifier';
import { Spinner } from '/imports/react-ui/common';
import { Brands } from '/imports/api/brands/brands';
import { Facebook } from '../components';


const apps = new ReactiveVar([]);
const pages = new ReactiveVar([]);

function composer(props, onData) {
  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const brands = Brands.find().fetch();

  if (apps.get().length === 0) {
    Meteor.call('integrations.getFacebookAppList', (err, res) => {
      apps.set(res);
    });
  }

  const save = (doc) => {
    Meteor.call(
      'integrations.addFacebook', doc,

      (error) => {
        if (error) {
          return Alert.error(error.error);
        }

        Alert.success('Congrats');
        return FlowRouter.go('/settings/integrations/list');
      },
    );
  };

  const getPages = (appId) => {
    Meteor.call('integrations.getFacebookPageList', { appId }, (err, res) => {
      if (err) {
        return Alert.error(err.reason);
      }

      return pages.set(res);
    });
  };

  if (brandsHandler.ready()) {
    return onData(
      null,
      {
        brands,
        save,
        getPages,
        apps: apps.get(),
        pages: pages.get(),
      },
    );
  }

  return null;
}

export default compose(getTrackerLoader(composer, Spinner))(Facebook);
