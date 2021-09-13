import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { WEBHOOK_DOC_URL } from '../../constants';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { Description } from '../../styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

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
            {__(
              'This token will be used to sign the incoming payload, so that erxes can verify that the request came from trusted sources.'
            )}
          </Description>
          <FormControl
            {...formProps}
            name="Token (otional)"
            placeholder={__('Will be generated automatically when left blank')}
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

        <FormGroup>
          <p>
            {'For more information, go to '}
            <a target="_blank" rel="noopener noreferrer" href={WEBHOOK_DOC_URL}>
              documentaion
            </a>
          </p>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
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
