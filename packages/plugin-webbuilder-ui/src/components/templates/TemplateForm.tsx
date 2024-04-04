import 'grapesjs/dist/css/grapes.min.css';

import { ISite, ISiteDoc } from '../../types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  closeModal: () => void;
  useTemplate: (_id: string, name: string) => void;
  saveSite: (_id: string, args: ISite) => void;
  currentTemplateId?: string;
  selectedSite: ISiteDoc;
};

type State = {
  name: string;
};

class TemplateForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: props.selectedSite.name
    };
  }

  onClick = () => {
    const { name } = this.state;
    const {
      useTemplate,
      saveSite,
      selectedSite,
      currentTemplateId
    } = this.props;

    if (selectedSite._id) {
      return saveSite(selectedSite._id, {
        name,
        domain: selectedSite.domain || ''
      });
    }

    return useTemplate(currentTemplateId || '', name);
  };

  render() {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Your WebSite Name</ControlLabel>

          <FormControl
            name="name"
            autoFocus={true}
            defaultValue={this.state.name}
            required={true}
            onChange={(e: any) => this.setState({ name: e.target.value })}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="check-circle"
            onClick={this.onClick}
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default TemplateForm;
