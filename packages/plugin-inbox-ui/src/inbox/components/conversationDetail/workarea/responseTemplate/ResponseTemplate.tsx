import Button from '@erxes/ui/src/components/Button';
import Popover from '@erxes/ui/src/components/Popover';
import { IAttachment } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
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

const ResponseTemplate = (props: Props) => {
  const { brands, content, brandId, attachments } = props;

  const saveTrigger = (
    <Button id="response-template-handler" btnStyle="link">
      <Tip placement="top" text={__('Save as template')}>
        <Icon icon="file-upload-alt" />
      </Tip>
    </Button>
  );

  const popover = (close) => (
    <div className="popover-template" id="templates-popover">
      <div className='popover-header'>{__('Response Templates')}</div>
      <PopoverContent {...props} onSelectTemplate={close} />
    </div>
  );

  return (
    <ResponseTemplateStyled>
      <Popover
        placement="left-end"
        closeAfterSelect={true}
        trigger={
          <Tip placement="top" text={__('Response template')}>
            <Icon icon="file-bookmark-alt" />
          </Tip>
        }
      >
        {popover}
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
};

export default ResponseTemplate;
