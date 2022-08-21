import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import { SettingsContent } from './styles';

// type Props = {
//   renderButton: (props: IButtonMutateProps) => JSX.Element;
//   callback: () => void;
//   onChannelChange: () => void;
//   channelIds: string[];
// };

class SocialPayConfigForm extends React.Component {
  generateDoc = (values: {
    name: string;
    phoneNumber: string;
    recordUrl: string;
    brandId: string;
  }) => {
    return {
      name: `${values.name} - ${values.phoneNumber}`,
      brandId: values.brandId,
      kind: 'callpro',
      data: {
        recordUrl: values.recordUrl,
        phoneNumber: values.phoneNumber
      }
    };
  };

  renderItem = (key: string, title: string, description?: string) => {
    // const { currentMap } = this.state;
    // let value = currentMap[key] || "";

    const value = '';

    // if (key === "callbackUrl" && !value) {
    //   value = 'https://localhost:3000/payments';
    //   currentMap[key] = value;
    // }

    // if (key === "qpayUrl" && !value) {
    //   value = 'https://merchant.qpay.mn';
    //   currentMap[key] = value;
    // }

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          defaultValue={value}
          // onChange={this.onChangeConfig.bind(this, key)}
          value={value}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    // const { renderButton, callback, onChannelChange, channelIds } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('inStoreSPTerminal', 'Terminal')}
          {this.renderItem('inStoreSPKey', 'Key')}
          {this.renderItem('inStoreSPUrl', 'InStore SocialPay url')}
          {this.renderItem(
            'pushNotification',
            'Push notification url with /pushNotif'
          )}
        </SettingsContent>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            // onClick={callback}
            icon="times-circle"
          >
            Cancel
          </Button>
          {/* {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback
          })} */}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default SocialPayConfigForm;
