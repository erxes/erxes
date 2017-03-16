/* global location */

import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Loader } from '/imports/react-ui/common';
import Alert from 'meteor/erxes-notifier';
import { Brands } from '/imports/api/brands/brands';
import { Twitter } from '../components';


function composer(props, onData) {
  if (props.type === 'link') {
    return Meteor.call('integrations.getTwitterAuthorizeUrl', (err, url) => {
      location.href = url;
    });
  }

  const brandsHandler = Meteor.subscribe('brands.list', 0);
  const brands = Brands.find().fetch();

  const save = (brandId) => {
    Meteor.call(
      'integrations.addTwitter',
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
      },
    );
  };

  if (brandsHandler.ready()) {
    return onData(null, { brands, save });
  }

  return null;
}

export default compose(getTrackerLoader(composer, Loader))(Twitter);
