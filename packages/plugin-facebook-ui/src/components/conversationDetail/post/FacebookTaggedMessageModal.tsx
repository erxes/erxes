import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { FacebookTagText } from './styles';

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
          <p>
            You are sending a message outside the 7 days messaging window.
            Facebook requires a tag to be added to this message. Select one of
            the following tags to send the message.
          </p>
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

          <FacebookTagText>
            Message tags may not be used to send promotional content, including
            but not limited to deals,purchase, offers, coupons, and discounts.
            Use of tags outside of the approved use cases may result in
            restrictions on the Page's ability to send messages.
            <a
              href="https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {__('Learn more')}
            </a>
          </FacebookTagText>
        </FormGroup>

        <ModalFooter>
          <Button onClick={this.onSave} btnStyle="success">
            Submit
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  };

  render() {
    const trigger = <Button btnStyle="default">{__('Choose tag')}</Button>;

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
