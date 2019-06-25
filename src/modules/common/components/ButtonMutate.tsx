import client from 'apolloClient';
import gql from 'graphql-tag';
import { colors } from 'modules/common/styles';
import { __, Alert } from 'modules/common/utils';
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
  callback?: (data?: any) => void;
  children?: React.ReactNode;
  refetchQueries?: any;
  isSubmitted?: boolean;
  type?: string;
  disabled?: boolean;
  block?: boolean;
};

class ButtonMutate extends React.Component<Props, { isLoading: boolean }> {
  static defaultProps = {
    successMessage: 'Successfull',
    btnSize: 'medium',
    icon: 'checked-1'
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

      .then(({ data }) => {
        if (successMessage) {
          Alert.success(successMessage);
        }

        if (callback) {
          callback(data);
        }

        this.setState({ isLoading: false });
      })
      .catch(error => {
        if (error.message.includes('Invalid login')) {
          Alert.error(
            'The email address or password you entered is incorrect.'
          );
        } else {
          Alert.error(error.message);
        }
        this.setState({ isLoading: false });
      });
  };

  render() {
    const {
      children = __('Save'),
      btnSize,
      icon,
      type,
      disabled,
      block
    } = this.props;
    const { isLoading } = this.state;

    return (
      <Button
        disabled={disabled || isLoading}
        btnStyle="success"
        size={btnSize}
        type={type}
        onClick={type ? undefined : this.mutate}
        icon={isLoading ? undefined : icon}
        block={block}
      >
        {isLoading && <ImportLoader />}
        {children}
      </Button>
    );
  }
}

export default ButtonMutate;
