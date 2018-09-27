import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Signature } from '../components';
import { IEmailSignature } from '../types';

type Props = {
  currentUser: IUser;
  brandsQuery: any;
  closeModal: () => void;

  saveMutation: (params: { variables: { 
    signatures: IEmailSignature[];
  } }) => Promise<any>;
};

const SignatureContainer = (props: Props) => {
  const { brandsQuery, saveMutation, currentUser } = props;

  // save email configs action
  const save = signatures => {
    const doc: Array<{ brandId: string, signature: string }> = [];

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
  const signatures: Array<{ brandId?: string, brandName: string, signature?: string }> = [];
  const brands = brandsQuery.brands || [];

  brands.forEach(brand => {
    // previously configured signature
    const oldEntry = emailSignatures.find(
      signature => signature.brandId === brand._id
    );

    signatures.push({
      brandId: brand._id,
      brandName: brand.name || '',
      signature: oldEntry ? oldEntry.signature : ''
    });
  });

  const updatedProps = {
    ...props,
    signatures,
    save
  };

  return <Signature {...updatedProps} />;
};

const WithQuery = compose(
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

const WithConsumer = (props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer; 