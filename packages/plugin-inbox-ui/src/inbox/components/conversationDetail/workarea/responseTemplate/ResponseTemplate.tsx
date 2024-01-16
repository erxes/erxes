import Button from '@erxes/ui/src/components/Button';
import { IAttachment } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PopoverContent from '../../../../containers/conversationDetail/responseTemplate/PopoverContent';
import React from 'react';
import { ResponseTemplateStyled } from '@erxes/ui-inbox/src/inbox/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import strip from 'strip';

type Props = {
  brandId?: string;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  attachments?: IAttachment[];
  content?: string;
};

class ResponseTemplate extends React.Component<Props> {
  private overlayRef;

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
