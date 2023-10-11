import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { IAttachment } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
import PopoverContent from '../../../../containers/conversationDetail/responseTemplate/PopoverContent';
import { ResponseTemplateStyled } from '@erxes/ui-inbox/src/inbox/styles';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import strip from 'strip';

type Props = {
  brandId?: string;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  attachments?: IAttachment[];
  content?: string;
};

type State = {
  keysPressed: any;
};

class ResponseTemplate extends React.Component<Props, State> {
  private overlayRef;

  constructor(props: Props) {
    super(props);

    this.state = {
      keysPressed: {}
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown = (event: any) => {
    const { keysPressed } = this.state;
    const key = event.key;
    const element = document.getElementById('overlay-trigger-button');

    this.setState({ keysPressed: { ...keysPressed, [key]: true } }, () => {
      if (this.state.keysPressed.Control === true && event.keyCode === 51) {
        element.click();
      }
    });
  };

  handleKeyUp = (event: any) => {
    delete this.state.keysPressed[event.key];

    this.setState({ keysPressed: { ...this.state.keysPressed } });
  };

  hidePopover = () => {
    this.overlayRef.hide();
  };

  render() {
    const { brands, content, brandId, attachments } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__('Save as template')}>
          <Icon icon="file-upload-alt" />
        </Tip>
      </Button>
    );

    const popover = (
      <Popover className="popover-template" id="templates-popover">
        <Popover.Title as="h3">{__('Response Templates')}</Popover.Title>
        <Popover.Content>
          <PopoverContent {...this.props} onSelectTemplate={this.hidePopover} />
        </Popover.Content>
      </Popover>
    );

    return (
      <ResponseTemplateStyled>
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose={true}
          ref={overlayTrigger => {
            this.overlayRef = overlayTrigger;
          }}
        >
          <Button btnStyle="link" id="overlay-trigger-button">
            <Tip text={__('Response template')}>
              <Icon icon="file-bookmark-alt" />
            </Tip>
          </Button>
        </OverlayTrigger>

        <Modal
          trigger={strip(content) ? saveTrigger : <span />}
          content={content}
          files={attachments}
          brands={brands}
          brandId={brandId}
        />
      </ResponseTemplateStyled>
    );
  }
}

export default ResponseTemplate;
