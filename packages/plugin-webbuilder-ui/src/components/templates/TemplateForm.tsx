import 'grapesjs/dist/css/grapes.min.css';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  closeModal: () => void;
  use: (_id: string, name: string) => void;
  currentTemplateId?: string;
};

type State = {
  name: string;
};

class TemplateForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: ''
    };
  }

  render() {
    const { use, closeModal, currentTemplateId } = this.props;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Your WebSite Name</ControlLabel>

          <FormControl
            name="name"
            autoFocus={true}
            defaultValue={name}
            required={true}
            onChange={(e: any) => this.setState({ name: e.target.value })}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            icon="plus-circle"
            onClick={() => use(currentTemplateId || '', this.state.name)}
            uppercase={false}
          >
            Create
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default TemplateForm;
