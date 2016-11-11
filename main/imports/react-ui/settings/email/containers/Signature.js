import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { composeWithTracker } from 'react-komposer';
import { Brands } from '/imports/api/brands/brands';
import { Signature } from '../components';

function composer(props, onData) {
  const brandHandle = Meteor.subscribe('brands.list');

  // save email configs action
  const save = (signatures, callback) => {
    const doc = [];

    // remove brandName from list
    _.each(signatures, (signature) => {
      doc.push({
        brandId: signature.brandId,
        signature: signature.content,
      });
    });

    Meteor.call('users.configEmailSignature', { signatures: doc }, (...params) => {
      callback(...params);
    });
  };

  if (brandHandle.ready()) {
    const currentUser = Meteor.user();
    const emailSignatures = currentUser.emailSignatures || [];
    const signatures = [];

    Brands.find().forEach((brand) => {
      // previously configured signature
      const oldEntry = _.find(emailSignatures, (signature) =>
        signature.brandId === brand._id
      );

      // default content
      let content = '';

      if (oldEntry) {
        content = oldEntry.signature;
      }

      signatures.push({
        brandId: brand._id,
        brandName: brand.name,
        content,
      });
    });

    onData(null, { signatures, save });
  }
}

export default composeWithTracker(composer)(Signature);
