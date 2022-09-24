import React from 'react';

import { ButtonMutate } from '@erxes/ui/src/components';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Label from '@erxes/ui/src/components/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';

import { mutations } from '../graphql';
import { IPaymentConfigDocument } from '../types';
import QpayForm from './form/QpayForm';
import SocialPayForm from './form/SocialPayForm';

type Props = {
  _id?: string;
  paymentConfig: IPaymentConfigDocument;
  removePaymentConfig: (paymentConfig: IPaymentConfigDocument) => void;
};

type State = {
  externalData: any;
};

class IntegrationListItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      externalData: null
    };
  }

  renderRemoveAction() {
    const { paymentConfig, removePaymentConfig } = this.props;

    if (!removePaymentConfig) {
      return null;
    }

    const onClick = () => removePaymentConfig(paymentConfig);

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  }

  renderEditAction() {
    const { paymentConfig } = this.props;
    const { type } = paymentConfig;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={mutations.paymentConfigsEdit}
          variables={values}
          callback={callback}
          // refetchQueries={getRefetchQueries(this.props.kind)}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={__(`You successfully edited a`) + `${name}`}
        />
      );
    };

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    let content = props => (
      <QpayForm
        {...props}
        paymentConfig={paymentConfig}
        renderButton={renderButton}
      />
    );

    if (type.toLowerCase().includes('social')) {
      content = props => (
        <SocialPayForm
          {...props}
          paymentConfig={paymentConfig}
          renderButton={renderButton}
        />
      );
    }

    return (
      <ActionButtons>
        <ModalTrigger
          title="Edit config"
          trigger={editTrigger}
          content={content}
        />
      </ActionButtons>
    );
  }

  render() {
    const { paymentConfig } = this.props;
    const labelStyle = 'success';
    const status = paymentConfig.status;

    return (
      <tr key={paymentConfig._id}>
        <td>{paymentConfig.name}</td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>

        <td>
          <ActionButtons>
            {this.renderEditAction()}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default IntegrationListItem;
