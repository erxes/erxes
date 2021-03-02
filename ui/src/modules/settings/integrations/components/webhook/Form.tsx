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
import { Description } from '../../styles';

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
  "attachments": [{
      "url": "/images/example.png",
      "text": "Example",
      "size": 1048576, // 1mb
      "type": "image/png"
  }],
  "companyPrimaryEmail":"example@company.com",
  "companyPrimaryPhone":"+123456789",
  "companyPrimaryName":"example llc",
  "companyWebsite":"https://company.com",
  "companyIndustry":"Automobiles",
  "companyBusinessType":"Investor",
  "customFields": [{
      "name": "custom field name",
      "value": "custom field value"
  }]
}`;

class Webhook extends React.Component<Props> {
  generateDoc = (values: {
    name: string;
    script: string;
    token: string;
    origin: string;
    brandId: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'webhook',
      data: {
        script: values.script,
        token: values.token,
        origin: values.origin
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
          <ControlLabel required={false}>Token</ControlLabel>
          <Description>
            {
              'This token will be used to sign the incoming payload, so that erxes can verify that the request came from trusted sources.'
            }
          </Description>
          <FormControl
            {...formProps}
            name="Token (otional)"
            placeholder="Will be generated automatically when left blank"
            required={false}
            autoFocus={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={false}>Origin</ControlLabel>
          <Description>
            {
              'Enter the IP address of the host that sending request payload, so that erxes can verify that the request came from trusted sources.'
            }
          </Description>
          <FormControl
            {...formProps}
            name="origin"
            placeholder="0.0.0.0 (optional)"
            required={false}
            autoFocus={false}
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
