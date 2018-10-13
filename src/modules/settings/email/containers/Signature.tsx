import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert } from 'modules/common/utils';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Spinner } from '../../../common/components';
import { queries as brandQueries } from '../../brands/graphql';
import { Signature } from '../components';
import { IEmailSignature, IEmailSignatureWithBrand } from '../types';

type Props = {
  currentUser: IUser;
  userDetailQuery: any;
  brandsQuery: any;
  closeModal: () => void;

  saveMutation: (
    params: {
      variables: {
        signatures: IEmailSignature[];
      };
    }
  ) => Promise<any>;
};

const SignatureContainer = (props: Props) => {
  const { userDetailQuery, brandsQuery, saveMutation } = props;

  if (userDetailQuery.loading || brandsQuery.loading) {
    return <Spinner />;
  }

  // save email configs action
  const save = (signaturesToSave: IEmailSignatureWithBrand[]) => {
    const doc: IEmailSignature[] = [];

    // remove brandName from list
    signaturesToSave.forEach(item => {
      if (item.signature) {
        doc.push({
          brandId: item.brandId,
          signature: item.signature
        });
      }
    });

    saveMutation({ variables: { signatures: doc } })
      .then(() => {
        Alert.success('Congrats');
        userDetailQuery.refetch();
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  const user = userDetailQuery.userDetail;
  const emailSignatures = user.emailSignatures || [];
  const signatures: IEmailSignatureWithBrand[] = [];
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
  graphql(gql(brandQueries.brands), { name: 'brandsQuery' }),
  graphql(gql(teamQueries.userDetail), {
    name: 'userDetailQuery',
    options: ({ currentUser }: { currentUser: IUser }) => ({
      variables: { _id: currentUser._id }
    })
  }),
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

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
