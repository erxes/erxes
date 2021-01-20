import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/auth/graphql';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Spinner from '../../../common/components/Spinner';
import { queries as brandQueries } from '../../brands/graphql';
import { BrandsQueryResponse } from '../../brands/types';
import Signature from '../components/Signature';
import {
  IEmailSignature,
  IEmailSignatureWithBrand,
  UsersConfigEmailSignaturesMutationResponse,
  UsersConfigEmailSignaturesMutationVariables
} from '../types';

type Props = {
  currentUser: IUser;
  closeModal: () => void;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props &
  UsersConfigEmailSignaturesMutationResponse;

const SignatureContainer = (props: FinalProps) => {
  const { currentUser, brandsQuery, saveMutation } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  // save email configs action
  const save = (signaturesToSave: IEmailSignatureWithBrand[], callback) => {
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
        Alert.success('Great job! You just set up your email signature.');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const emailSignatures = currentUser.emailSignatures || [];
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

const WithQuery = withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, {}>(gql(brandQueries.brands), {
      name: 'brandsQuery'
    }),
    graphql<
      Props,
      UsersConfigEmailSignaturesMutationResponse,
      UsersConfigEmailSignaturesMutationVariables
    >(
      gql`
        mutation usersConfigEmailSignatures($signatures: [EmailSignature]) {
          usersConfigEmailSignatures(signatures: $signatures) {
            _id
          }
        }
      `,
      {
        name: 'saveMutation',
        options: () => ({
          refetchQueries: [
            {
              query: gql(queries.currentUser)
            }
          ]
        })
      }
    )
  )(SignatureContainer)
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
