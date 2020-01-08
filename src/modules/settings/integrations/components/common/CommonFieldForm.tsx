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
import { RefreshPermission } from '../../styles';

const { REACT_APP_API_URL } = getEnv();

type Props = {
  integrationId: string;
  integrationKind: string;
  name: string;
  brandId: string;
  onSubmit: (
    id: string,
    { name, brandId }: { name: string; brandId: string }
  ) => void;
  closeModal: () => void;
};

type State = {
  name: string;
  brandId: string;
};

class CommonFieldForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.name || '',
      brandId: props.brandId || ''
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
    const { name, brandId } = this.state;

    const onBrandChange = e => {
      this.setState({ brandId: e.target.value });
    };

    const onNameBlur = e => {
      this.setState({ name: e.target.value });
    };

    const saveIntegration = e => {
      e.preventDefault();

      onSubmit(integrationId, { name, brandId });
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
        />
        {this.renderSpecificContent()}
        <ModalFooter>
          <Button
            onClick={saveIntegration}
            type="submit"
            btnStyle="success"
            icon="checked-1"
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default CommonFieldForm;
