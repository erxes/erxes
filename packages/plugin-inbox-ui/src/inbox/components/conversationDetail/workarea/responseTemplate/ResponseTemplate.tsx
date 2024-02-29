import Button from '@erxes/ui/src/components/Button';
import { IAttachment } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
import { Popover } from '@headlessui/react';
import PopoverContent from '../../../../containers/conversationDetail/responseTemplate/PopoverContent';
import { PopoverHeader } from '@erxes/ui/src/styles/main';
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
  render() {
    const { brands, content, brandId, attachments } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__('Save as template')}>
          <Icon icon="file-upload-alt" />
        </Tip>
      </Button>
    );

    const popover = (close) => (
      <div className="popover-template" id="templates-popover">
        <PopoverHeader>{__('Response Templates')}</PopoverHeader>
        <PopoverContent {...this.props} onSelectTemplate={close} />
      </div>
    );

    return (
      <ResponseTemplateStyled>
        <Popover
        // trigger="click"
        // placement="top"
        // overlay={popover}
        // rootClose={true}
        // ref={overlayTrigger => {
        //   this.overlayRef = overlayTrigger;
        // }}
        >
          {({ close }) => (
            <>
              <Popover.Button>
                <Button btnStyle="link" id="overlay-trigger-button">
                  <Tip text={__('Response template')}>
                    <Icon icon="file-bookmark-alt" />
                  </Tip>
                </Button>
              </Popover.Button>
              <Popover.Panel>{popover(close)}</Popover.Panel>
            </>
          )}
        </Popover>

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
