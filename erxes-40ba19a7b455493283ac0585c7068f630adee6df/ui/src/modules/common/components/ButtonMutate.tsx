import client from 'apolloClient';
import gql from 'graphql-tag';
import { colors } from 'modules/common/styles';
import { __, Alert, confirm } from 'modules/common/utils';
import { rotate } from 'modules/common/utils/animations';
import React from 'react';
import styled from 'styled-components';
import Button from '../components/Button';

export const SmallLoader = styled.i`
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
  btnSize?: string;
  uppercase?: boolean;
  successMessage?: string;
  btnStyle?: string;
  icon?: string;
  callback?: (data?: any) => void;
  children?: React.ReactNode;
  refetchQueries?: any;
  isSubmitted?: boolean;
  type?: string;
  disabled?: boolean;
  disableLoading?: boolean;
  block?: boolean;
  confirmationUpdate?: boolean;
  beforeSubmit?: () => void;
  resetSubmit?: () => void;
};

class ButtonMutate extends React.Component<Props, { isLoading: boolean }> {
  static defaultProps = {
    btnSize: 'medium',
    icon: 'check-circle'
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

  invokeMutate = () => {
    const {
      mutation,
      callback,
      variables,
      successMessage = '',
      refetchQueries,
      beforeSubmit,
      disableLoading,
      resetSubmit
    } = this.props;

    if (beforeSubmit) {
      beforeSubmit();
    }

    if (!disableLoading) {
      this.setState({ isLoading: true });
    }

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

        if (!disableLoading) {
          this.setState({ isLoading: false });
        }
      })
      .catch(error => {
        if (error.message.includes('Invalid login')) {
          Alert.error(
            'The email address or password you entered is incorrect.'
          );
        } else {
          Alert.error(error.message);
        }

        if (resetSubmit) {
          resetSubmit();
        }

        if (!disableLoading) {
          this.setState({ isLoading: false });
        }
      });
  };

  mutate = () => {
    const { confirmationUpdate } = this.props;

    if (confirmationUpdate) {
      return confirm('This will permanently update are you absolutely sure?', {
        hasUpdateConfirm: true
      })
        .then(() => {
          this.invokeMutate();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }

    return this.invokeMutate();
  };

  render() {
    const {
      children = __('Save'),
      btnSize,
      icon,
      type,
      btnStyle = 'success',
      disabled,
      block,
      uppercase
    } = this.props;

    const { isLoading } = this.state;

    return (
      <Button
        uppercase={uppercase || false}
        disabled={disabled || isLoading}
        btnStyle={btnStyle}
        size={btnSize}
        type={type}
        onClick={type ? undefined : this.mutate}
        icon={isLoading ? undefined : icon}
        block={block}
      >
        {isLoading && <SmallLoader />}
        {children}
      </Button>
    );
  }
}

export default ButtonMutate;
