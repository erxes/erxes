import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';

type Props = {
  integrationId: string;
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
