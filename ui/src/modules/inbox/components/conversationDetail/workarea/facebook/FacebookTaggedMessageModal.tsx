import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  selectTag: (value: string) => void;
  hideMask: () => void;
  tag: string;
};

class Modal extends React.Component<Props, {}> {
  onSave = () => {
    const tag = (document.getElementById(
      'facebook-message-tag'
    ) as HTMLInputElement).value;

    this.props.selectTag(tag);
    this.props.hideMask();

    const element = document.querySelector('button.close') as HTMLElement;

    return element.click();
  };

  renderForm = () => {
    const tags = [
      { label: 'Confirmed Event Update', value: 'CONFIRMED_EVENT_UPDATE' },
      { label: 'Post-Purchase Update', value: 'POST_PURCHASE_UPDATE' },
      { label: 'Account Update', value: 'ACCOUNT_UPDATE' }
    ];

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Tag</ControlLabel>
          <FormControl
            id="facebook-message-tag"
            componentClass="select"
            placeholder={__('Select Brand') as string}
            defaultValue={this.props.tag}
          >
            {tags.map(tag => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success" uppercase={false}>
            Submit
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  };

  render() {
    const trigger = (
      <Button btnStyle="default" uppercase={false}>
        {__('Choose tag')}
      </Button>
    );

    return (
      <ModalTrigger
        title="Choose tag"
        trigger={trigger}
        content={this.renderForm}
      />
    );
  }
}

export default Modal;
