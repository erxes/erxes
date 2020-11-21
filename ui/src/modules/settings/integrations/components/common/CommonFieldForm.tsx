import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import { INTEGRATION_KINDS } from '../../constants';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { RefreshPermission } from '../../styles';
import { IntegrationMutationVariables } from '../../types';

const { REACT_APP_API_URL } = getEnv();

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

  renderFacebookContent = () => {
    const onRefresh = () => {
      const link = 'fblogin';
      const kind = 'facebook';

      const url = `${REACT_APP_API_URL}/connect-integration?link=${link}&kind=${kind}`;

      window.location.replace(url);
    };

    return (
      <>
        <Info>
          {__(
            'Page permissions can be dropped by Messenger platform if the admin of the page changes their account password or due to some other unexpected reason. In case of any trouble with message sending, or in using some other service, please refresh your permissions using the below button.'
          )}
          <RefreshPermission onClick={onRefresh}>
            Refresh permissions
          </RefreshPermission>
        </Info>
      </>
    );
  };

  renderSpecificContent = () => {
    const { integrationKind } = this.props;

    if (integrationKind && integrationKind.includes('facebook')) {
      return this.renderFacebookContent();
    }

    return;
  };

  renderScript = () => {
    const { integrationKind } = this.props;

    if (integrationKind !== INTEGRATION_KINDS.WEBHOOK) {
      return null;
    }

    const { webhookData } = this.state;

    const onScriptChange = e => {
      this.setState({
        webhookData: { ...webhookData, script: e.target.value }
      });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>{__('Script')}</ControlLabel>
        <FormControl
          componentClass="textarea"
          required={true}
          defaultValue={webhookData.script}
          onChange={onScriptChange}
        />
      </FormGroup>
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

        {this.renderSpecificContent()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>
          <Button
            onClick={saveIntegration}
            type="submit"
            btnStyle="success"
            icon="check-circle"
            uppercase={false}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default CommonFieldForm;
