import React from 'react';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import RequestForm from '../components/RequestForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { Alert, ButtonMutate, confirm } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IGrantRequest } from '../../common/type';
import { refetchQueries } from '../../common/utils';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import client from '@erxes/ui/src/apolloClient';

type Props = {
  closeModal: () => void;
  contentType: string;
  contentTypeId: string;
  object: any;
  currentUser: IUser;
  request: IGrantRequest;
};

type FinalProps = {
  cancelRequest: any;
} & Props;

class RequestFormContainer extends React.Component<
  FinalProps,
  { loading: boolean }
> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      closeModal,
      contentType,
      contentTypeId,
      object,
      currentUser,
      request
    } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      let mutation = mutations.addGrantRequest;
      let successAction = 'added';

      if (object) {
        mutation = mutations.editGrantRequest;
        successAction = 'edited';
      }

      return (
        <ButtonMutate
          disabled={this.state.loading}
          mutation={mutation}
          variables={values}
          callback={closeModal}
          isSubmitted={isSubmitted}
          refetchQueries={refetchQueries({ contentTypeId, contentType })}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const cancelRequest = () => {
      confirm().then(() => {
        this.setState({ loading: true });
        this.props
          .cancelRequest({ variables: { contentTypeId, contentType } })
          .then(() => {
            closeModal();
            Alert.success('Cancelled request successfully');
            this.setState({ loading: false });
          })
          .catch(e => {
            Alert.error(e.message);
            this.setState({ loading: false });
          });
      });
    };

    const checkConfig = async ({
      contentType,
      contentTypeId,
      action,
      scope
    }) => {
      return await client
        .query({
          query: gql(queries.checkConfig),
          fetchPolicy: 'network-only',
          variables: { contentType, contentTypeId, action, scope }
        })
        .then(({ data }) => {
          return data.checkGrantActionConfig;
        });
    };

    const updatedProps: any = {
      contentType,
      contentTypeId,
      object,
      currentUser,
      renderButton,
      cancelRequest,
      checkConfig,
      loading: this.state.loading
    };

    if (!!Object.keys(request).length) {
      updatedProps.request = {
        ...request,
        params: JSON.parse(request?.params || '{}')
      };
    }

    return <RequestForm {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(mutations.cancelRequest), {
      name: 'cancelRequest',
      options: ({ contentTypeId, contentType }) => ({
        refetchQueries: refetchQueries({ contentTypeId, contentType })
      })
    })
  )(RequestFormContainer)
);
