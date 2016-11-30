import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { composeWithTracker } from 'react-komposer';
import Alert from 'meteor/erxes-notifier';
import { Loader } from '/imports/react-ui/common';
import { Brands } from '/imports/api/brands/brands';
import { Social } from '../components';


function composer(props, onData) {
  if (props.type === 'link') {
    return Meteor.call('integrations.getFacebookAuthorizeUrl', (err, url) => {
      location.href = url;
    });
  }

  const brandsHandler = Meteor.subscribe('brands.list');
  const brands = Brands.find().fetch();

  const save = (brandId) => {
    Meteor.call(
      'integrations.addFacebook',
      {
        brandId,
        queryParams: FlowRouter.current().queryParams,
      },

      (error) => {
        if (error) {
          return Alert.success(error.error);
        }

        Alert.success('Congrats');
        return FlowRouter.go('/settings/integrations/list');
      }
    );
  };

  if (brandsHandler.ready()) {
    return onData(null, { brands, save });
  }

  return null;
}

export default composeWithTracker(composer, Loader)(Social);
