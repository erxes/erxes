import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { Loader } from '/imports/react-ui/common';
import { Signature } from '../components';

function composer(props, onData) {
  const brandHandle = Meteor.subscribe('brands.list', 0);

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
      const oldEntry = emailSignatures.find(signature => signature.brandId === brand._id);

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

export default compose(getTrackerLoader(composer, Loader))(Signature);
