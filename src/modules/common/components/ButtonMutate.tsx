import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { withRouter } from 'react-router';
import Button from '../components/Button';
import { IRouterProps } from '../types';

interface IProps extends IRouterProps {
  mutation: string;
  queryParams?: any;
  getVariables: () => void;
  successMessage?: string;
  btnSize?: string;
  callback?: () => void;
  children?: React.ReactNode;
  refetchQueries?: any;
  history: any;
  isSubmitted: boolean;
}

class ButtonMutate extends React.Component<IProps> {
  static defaultProps = {
    successMessage: 'Successfull',
    btnSize: 'small'
  };

  componentDidUpdate = (prevProps: IProps) => {
    if (prevProps.isSubmitted !== this.props.isSubmitted) {
      this.mutate();
    }
  };

  mutate = () => {
    const {
      mutation,
      callback,
      getVariables,
      successMessage = '',
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
    const { children, btnSize, queryParams } = this.props;

    // tslint:disable-next-line:no-console
    console.log(queryParams);

    return (
      <Button btnStyle="success" size={btnSize} onClick={this.mutate}>
        {children}
      </Button>
    );
  }
}

export default withRouter<IProps>(ButtonMutate);
