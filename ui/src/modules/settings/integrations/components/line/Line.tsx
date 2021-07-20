import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onSave: (integration?) => void;
  webhookUrl?: string;
  closeModal: () => void;
};

type State = {
  channelIds: string[];
};

class Line extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      channelIds: []
    };
  }

  onChangeChannel = (values: string[]) => {
    this.setState({ channelIds: values });
  };

  generateDoc = (values: {
    name: string;
    channelId: string;
    channelSecret: string;
    brandId: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'smooch-line',
      channelIds: this.state.channelIds,
      data: {
        displayName: values.name,
        channelId: values.channelId,
        channelSecret: values.channelSecret
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, onSave, webhookUrl, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Line Channel ID</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="channelId"
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Line Channel Secret</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="channelSecret"
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <p>
            {__(
              'Copy and paste the webhook URL provided below into your LINE settings'
            )}
            .
            <a
              href="https://erxes.org/administrator/system-config#line"
              target="_blank"
              rel="noopener noreferrer"
            >
              {__('Learn more about LINE')}
            </a>
          </p>
          <ControlLabel>Webhook url</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            placeholder="Url will appear after save"
            value={webhookUrl}
          />
        </FormGroup>
        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
          )}
        />

        <SelectChannels
          defaultValue={this.state.channelIds}
          isRequired={true}
          onChange={this.onChangeChannel}
        />
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: onSave
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default Line;
