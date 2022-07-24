import { IField, IFieldLogic } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import {
  LeftSection,
  Preview,
  PreviewSection,
  ShowPreview
} from '@erxes/ui-forms/src/forms/styles';
import FieldPreview from '@erxes/ui-forms/src/forms/components/FieldPreview';

type Props = {
  onSubmit: (field: IField) => void;
  onDelete: (field: IField) => void;
  onCancel: () => void;
  mode: 'create' | 'update';
  field: any;
};

type State = {
  field: any;
};

class FieldForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { field } = props;

    this.state = {
      field
    };
  }

  setFieldAttrChanges(
    attributeName: string,
    value: string | boolean | number | string[] | number[] | IFieldLogic[]
  ) {
    const { field } = this.state;

    field[attributeName] = value;

    this.setState({ field });
  }

  onFieldChange = (
    name: string,
    value: string | boolean | number | string[] | number[] | IFieldLogic[]
  ) => {
    this.setFieldAttrChanges(name, value);
  };

  onSubmit = e => {
    e.persist();

    const { field } = this.state;

    this.props.onSubmit(field);
  };

  renderExtraButton() {
    const { mode, field } = this.props;

    if (mode === 'create') {
      return null;
    }

    const onDelete = e => {
      e.preventDefault();
      this.props.onDelete(field);
    };

    return (
      <Button btnStyle="danger" onClick={onDelete} icon="minus-circle-1">
        Delete
      </Button>
    );
  }

  renderLeftContent() {
    const { mode, onCancel } = this.props;
    const { field } = this.state;

    const label = e =>
      this.onFieldChange('label', (e.currentTarget as HTMLInputElement).value);

    const code = e =>
      this.onFieldChange('code', (e.currentTarget as HTMLInputElement).value);

    return (
      <>
        <CollapseContent
          title={__('General settings')}
          compact={true}
          open={true}
        >
          <FormGroup>
            <ControlLabel htmlFor="text" required={true}>
              Field Label
            </ControlLabel>

            <FormControl
              value={field.label || ''}
              onChange={label}
              autoFocus={true}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel htmlFor="code">Field Code</ControlLabel>
            <FormControl value={field.code || ''} onChange={code} />
          </FormGroup>
        </CollapseContent>

        <Modal.Footer>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={onCancel}
          >
            Cancel
          </Button>

          {this.renderExtraButton()}

          <Button
            onClick={this.onSubmit}
            btnStyle="success"
            icon={mode === 'update' ? 'check-circle' : 'plus-circle'}
          >
            {mode === 'update' ? 'Save' : 'Add Field'}
          </Button>
        </Modal.Footer>
      </>
    );
  }

  renderContent() {
    const { field } = this.state;

    return (
      <FlexItem>
        <LeftSection>{this.renderLeftContent()}</LeftSection>

        <PreviewSection>
          <Preview>
            <FieldPreview field={field} />

            <ShowPreview>
              <Icon icon="eye" /> {__('Field preview')}
            </ShowPreview>
          </Preview>
        </PreviewSection>
      </FlexItem>
    );
  }

  render() {
    const { mode, field, onCancel } = this.props;

    return (
      <Modal
        show={true}
        size="xl"
        onHide={onCancel}
        animation={false}
        enforceFocus={false}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {mode === 'create' ? 'Add' : 'Edit'} {field.type} field
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="ModalBody" className="md-padding">
          {this.renderContent()}
        </Modal.Body>
      </Modal>
    );
  }
}

export default FieldForm;
