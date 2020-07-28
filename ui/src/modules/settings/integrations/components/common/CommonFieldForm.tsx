import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';
import SelectChannels from '../../containers/SelectChannels';
import { RefreshPermission } from '../../styles';

const { REACT_APP_API_URL } = getEnv();

type CommonTypes = {
  name: string;
  brandId: string;
  channelIds: string[];
};

type Props = {
  integrationId: string;
  integrationKind: string;
  name: string;
  brandId: string;
  channelIds: string[];
  onSubmit: (id: string, { name, brandId, channelIds }: CommonTypes) => void;
  closeModal: () => void;
};

class CommonFieldForm extends React.PureComponent<Props, CommonTypes> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.name || '',
      brandId: props.brandId || '',
      channelIds: props.channelIds || []
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

  render() {
    const { integrationId, onSubmit, closeModal } = this.props;
    const { name, brandId, channelIds } = this.state;

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

      onSubmit(integrationId, { name, brandId, channelIds });
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
          description={__(
            'In which Channel(s) do you want to add this integration?'
          )}
          onChange={onChannelChange}
        />

        {this.renderSpecificContent()}
        <ModalFooter>
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
