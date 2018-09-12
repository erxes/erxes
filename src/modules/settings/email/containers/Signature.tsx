import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Signature } from '../components';

type Props = {
  brandsQuery: any,
  saveMutation: (params: { variables: { signatures: any } }) => any
};

const SignatureContainer = (props: Props, { currentUser }) => {
  const { brandsQuery, saveMutation } = props;

  // save email configs action
  const save = signatures => {
    const doc = [];

    // remove brandName from list
    signatures.forEach(signature => {
      if (signature.content) {
        doc.push({
          brandId: signature.brandId,
          signature: signature.content
        });
      }
    });

    saveMutation({ variables: { signatures: doc } })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  const emailSignatures = currentUser.emailSignatures || [];
  const signatures = [];
  const brands = brandsQuery.brands || [];

  brands.forEach(brand => {
    // previously configured signature
    const oldEntry = emailSignatures.find(
      signature => signature.brandId === brand._id
    );

    // default content
    let content = '';

    if (oldEntry) {
      content = oldEntry.signature;
    }

    signatures.push({
      brandId: brand._id,
      brandName: brand.name,
      content
    });
  });

  const updatedProps = {
    ...props,
    signatures,
    save
  };

  return <Signature {...updatedProps} />;
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
        }
      }
    `,
    {
      name: 'brandsQuery'
    }
  ),
  graphql(
    gql`
      mutation usersConfigEmailSignatures($signatures: [EmailSignature]) {
        usersConfigEmailSignatures(signatures: $signatures) {
          _id
        }
      }
    `,
    {
      name: 'saveMutation'
    }
  )
)(SignatureContainer);
