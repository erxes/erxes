import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Signature } from '../components';
import { Loading } from 'modules/common/components';

const SignatureContainer = props => {
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return <Loading title="Signature template" />;
  }

  // save email configs action
  const save = (signatures, callback) => {
    const doc = [];

    // remove brandName from list
    _.each(signatures, signature => {
      doc.push({
        brandId: signature.brandId,
        signature: signature.content,
      });
    });

    // TODO
    // Meteor.call('users.configEmailSignature', { signatures: doc }, (...params) => {
    //   callback(...params);
    // });
  };

  // TODO
  const currentUser = {} // Meteor.user();
  const emailSignatures = currentUser.emailSignatures || [];
  const signatures = [];

  brandsQuery.brands.forEach(brand => {
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

  const updatedProps = {
    ...this.props,
    signatures,
    save,
  };

  return <Signature {...updatedProps} />;
};

SignatureContainer.propTypes = {
  brandsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query objects($limit: Int) {
        brands(limit: $limit) {
          _id
          name
        }
      }
    `,
    {
      name: 'brandsQuery',
    },
  ),
)(SignatureContainer);
