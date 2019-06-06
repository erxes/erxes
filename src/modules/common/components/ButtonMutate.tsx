import client from 'apolloClient';
import gql from 'graphql-tag';
import { colors } from 'modules/common/styles';
import { Alert } from 'modules/common/utils';
import { rotate } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';
import Button from '../components/Button';

const ImportLoader = styled.i`
  width: 13px;
  height: 13px;
  animation: ${rotate} 0.75s linear infinite;
  border: 1px solid ${colors.borderDarker};
  border-top-color: ${colors.colorSecondary};
  border-right-color: ${colors.colorSecondary};
  border-radius: 100%;
  float: left;
  position: relative;
  top: 2px;
  margin-right: 5px;
`;

type Props = {
  mutation: string;
  variables: any;
  successMessage?: string;
  btnSize?: string;
  icon?: string;
  callback?: () => void;
  children?: React.ReactNode;
  refetchQueries?: any;
  isSubmitted?: boolean;
  type?: string;
};

class ButtonMutate extends React.Component<Props, { isLoading: boolean }> {
  static defaultProps = {
    successMessage: 'Successfull',
    btnSize: 'medium'
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.isSubmitted !== this.props.isSubmitted) {
      this.mutate();
    }
  };

  checkIsLoading = (
    elementLoading?: React.ReactNode,
    element?: React.ReactNode
  ) => {
    if (this.state.isLoading) {
      return elementLoading;
    }

    return element;
  };

  mutate = () => {
    const {
      mutation,
      callback,
      variables,
      successMessage = '',
      refetchQueries
    } = this.props;

    this.setState({ isLoading: true });

    client
      .mutate({
        mutation: gql(mutation),
        variables,
        refetchQueries
      })

      .then(() => {
        Alert.success(successMessage);

        if (callback) {
          callback();
        }

        this.setState({ isLoading: false });
      })
      .catch(error => {
        Alert.error(error.message);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const { children, btnSize, icon, type } = this.props;
    const { isLoading } = this.state;

    return (
      <Button
        disabled={isLoading}
        btnStyle="success"
        size={btnSize}
        type={type}
        onClick={type ? undefined : this.mutate}
        icon={isLoading ? undefined : icon}
      >
        {isLoading && <ImportLoader />}
        {children}
      </Button>
    );
  }
}

export default ButtonMutate;
