import Button from '@erxes/ui/src/components/Button';
import { IAttachment } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import Icon from '@erxes/ui/src/components/Icon';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
import { Popover } from '@headlessui/react';
import PopoverContent from '../../../../containers/conversationDetail/responseTemplate/PopoverContent';
import { PopoverHeader, PopoverPanel } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { ResponseTemplateStyled } from '@erxes/ui-inbox/src/inbox/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils/core';
import strip from 'strip';
import { usePopper } from 'react-popper';

type Props = {
  brandId?: string;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  attachments?: IAttachment[];
  content?: string;
};

const ResponseTemplate = (props: Props) => {
  const { brands, content, brandId, attachments } = props;
  let [referenceElement, setReferenceElement] = useState(null);
  let [popperElement, setPopperElement] = useState(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'left',
  });

  const saveTrigger = (
    <Button id="response-template-handler" btnStyle="link">
      <Tip placement="top" text={__('Save as template')}>
        <Icon icon="file-upload-alt" />
      </Tip>
    </Button>
  );

  const popover = (close) => (
    <div className="popover-template" id="templates-popover">
      <PopoverHeader>{__('Response Templates')}</PopoverHeader>
      <PopoverContent {...props} onSelectTemplate={close} />
    </div>
  );

  return (
    <ResponseTemplateStyled>
      <Popover style={{ position: 'relative' }}>
        {({ close }) => (
          <>
            <Popover.Button ref={setReferenceElement}>
              <Tip placement="top" text={__('Response template')}>
                <Icon icon="file-bookmark-alt" />
              </Tip>
            </Popover.Button>
            <PopoverPanel
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              {popover(close)}
            </PopoverPanel>
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
};

export default ResponseTemplate;
