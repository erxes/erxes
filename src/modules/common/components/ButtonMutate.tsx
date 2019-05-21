import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import Button from '../components/Button';

type Props = {
  mutation: string;
  getVariables: () => void;
  successMessage: string;
  btnSize?: string;
  callback?: () => void;
  children?: React.ReactNode;
  refetchQueries?: any;
};

class ButtonMutate extends React.Component<Props> {
  static defaultProps = {
    successMessage: 'Successfull',
    btnSize: 'small'
  };

  mutate = () => {
    const {
      mutation,
      callback,
      getVariables,
      successMessage,
      refetchQueries
    } = this.props;

    client
      .mutate({
        mutation: gql(mutation),
        variables: getVariables(),
        refetchQueries
      })

      .then(() => {
        Alert.success(successMessage);

        if (callback) {
          callback();
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { children, btnSize } = this.props;
    return (
      <Button btnStyle="success" size={btnSize} onClick={this.mutate}>
        {children}
      </Button>
    );
  }
}

export default ButtonMutate;
