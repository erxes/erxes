import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import { IntegrationMutationVariables } from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { __ } from '@erxes/ui/src/utils';

type CommonTypes = {
  name: string;
  brandId: string;
  channelIds: string[];
  webhookData: any;
};

type Props = {
  integrationId: string;
  integrationKind: string;
  name: string;
  brandId: string;
  channelIds: string[];
  webhookData: any;
  onSubmit: (
    id: string,
    { name, brandId, channelIds, data }: IntegrationMutationVariables
  ) => void;
  closeModal: () => void;
};

class CommonFieldForm extends React.PureComponent<Props, CommonTypes> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.name || '',
      brandId: props.brandId || '',
      channelIds: props.channelIds || [],
      webhookData: props.webhookData || {}
    };
  }

  renderScript = () => {
    const { integrationKind } = this.props;

    if (integrationKind !== INTEGRATION_KINDS.WEBHOOK) {
      return null;
    }

    const { webhookData } = this.state;

    const onChangeWebhookData = e => {
      webhookData[e.target.name] = e.target.value;

      this.setState({
        webhookData: { ...webhookData }
      });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={false}>Token</ControlLabel>
          <FormControl
            name="token"
            required={false}
            autoFocus={false}
            defaultValue={webhookData.token}
            onChange={onChangeWebhookData}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={false}>Origin</ControlLabel>
          <FormControl
            name="origin"
            required={false}
            autoFocus={false}
            defaultValue={webhookData.origin}
            onChange={onChangeWebhookData}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={false}>{__('Script')}</ControlLabel>
          <FormControl
            name="script"
            componentClass="textarea"
            required={true}
            defaultValue={webhookData.script}
            onChange={onChangeWebhookData}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const { integrationId, onSubmit, closeModal } = this.props;
    const { name, brandId, channelIds, webhookData } = this.state;

    const onBrandChange = e => {
      this.setState({ brandId: e.target.value });
    };

    const onChannelChange = (values: string[]) => {
      this.setState({ channelIds: values });
    };

    const onNameBlur = e => {
      this.setState({ name: e.target.value });
    };

    const saveIntegration = e => {
      e.preventDefault();

      let data;

      switch (this.props.integrationKind) {
        case 'webhook': {
          data = webhookData;

          break;
        }
      }

      onSubmit(integrationId, { name, brandId, channelIds, data });
      closeModal();
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
          <FormControl
            required={true}
            defaultValue={name}
            onBlur={onNameBlur}
            autoFocus={true}
          />
        </FormGroup>

        {this.renderScript()}

        <SelectBrand
          isRequired={true}
          defaultValue={brandId}
          onChange={onBrandChange}
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
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          <Button
            onClick={saveIntegration}
            type="submit"
            btnStyle="success"
            icon="check-circle"
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default CommonFieldForm;
