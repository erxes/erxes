import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as teamQueries } from 'modules/settings/team/graphql';
import { UserDetailQueryResponse } from 'modules/settings/team/types';
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
  userDetailQuery: UserDetailQueryResponse;
  brandsQuery: BrandsQueryResponse;
} & Props &
  UsersConfigEmailSignaturesMutationResponse;

const SignatureContainer = (props: FinalProps) => {
  const { userDetailQuery, brandsQuery, saveMutation } = props;

  if (userDetailQuery.loading || brandsQuery.loading) {
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

const WithQuery = withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, {}>(gql(brandQueries.brands), {
      name: 'brandsQuery'
    }),
    graphql<Props, UserDetailQueryResponse, { _id: string }>(
      gql(teamQueries.userDetail),
      {
        name: 'userDetailQuery',
        options: ({ currentUser }: { currentUser: IUser }) => ({
          variables: { _id: currentUser._id }
        })
      }
    ),
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
        name: 'saveMutation'
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
