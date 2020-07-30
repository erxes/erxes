import { IButtonMutateProps, IFormProps } from 'modules/common/types';

import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
};

class Telegram extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  generateDoc = (values: { name: string; token: string; brandId: string }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'smooch-telegram',
      data: {
        displayName: values.name,
        token: values.token
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Telegram Bot Token</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="token"
            required={true}
          />
        </FormGroup>

        <a
          href="https://docs.erxes.io/administrator/system-config#telegram"
          target="_blank"
          rel="noopener noreferrer"
        >
          {'Learn more about Telegram'}
        </a>

        <SelectBrand isRequired={true} formProps={formProps} />

        <ModalFooter>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default Telegram;
