import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Alert from 'meteor/erxes-notifier';
import { Brands } from '/imports/api/brands/brands';

export default ({ addMethodName, editMethodName }) =>
  function composer(props, onData) {
    const brandsHandler = Meteor.subscribe('brands.list', 0);
    const brands = Brands.find().fetch();

    const save = (doc) => {
      let methodName = `integrations.${addMethodName}`;
      let params = { doc };

      if (props.integration) {
        methodName = `integrations.${editMethodName}`;
        params = { _id: props.integration._id, doc };
      }

      Meteor.call(methodName, params, (error) => {
        if (error) {
          return Alert.error(error.reason);
        }

        Alert.success('Congrats');
        return FlowRouter.go('/settings/integrations/list');
      });
    };

    if (brandsHandler.ready()) {
      return onData(null, { brands, save });
    }

    return null;
  };
