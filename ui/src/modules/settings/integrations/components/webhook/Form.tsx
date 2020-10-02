import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { MarkdownWrapper } from 'modules/settings/styles';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

const examplePayload = `{
    "customerPrimaryEmail": "example@gmail.com",
    "customerPrimaryPhone": 99999999,
    "customerCode": 99999,
    "customerFirstName": "David",
    "customerLastName": "Anna",
    "content": "Content"
    "attachments": [
      {
        "url": "/images/example.png",
        "text": "Example",
        "size": 1048576, // 1mb
        "type": "image/png"
      }
    ]
}`;

class Webhook extends React.Component<Props> {
  generateDoc = (values: { name: string; script: string; brandId: string }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'webhook',
      data: {
        script: values.script
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback, onChannelChange, channelIds } = this.props;
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
          <ControlLabel>Script</ControlLabel>
          <FormControl {...formProps} name="script" componentClass="textarea" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Example payload</ControlLabel>
          <MarkdownWrapper>
            <pre>{examplePayload}</pre>
          </MarkdownWrapper>
        </FormGroup>

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
          )}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
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

export default Webhook;
