import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { IAttachment } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Modal from 'modules/inbox/containers/conversationDetail/responseTemplate/Modal';
import PopoverContent from 'modules/inbox/containers/conversationDetail/responseTemplate/PopoverContent';
import { ResponseTemplateStyled } from 'modules/inbox/styles';
import { IBrand } from 'modules/settings/brands/types';
import { IResponseTemplate } from 'modules/settings/responseTemplates/types';
import React from 'react';
import OverlayTrigger from 'react-bootstrap-latest/OverlayTrigger';
import Popover from 'react-bootstrap-latest/Popover';
import strip from 'strip';

type Props = {
  brandId?: string;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  attachments?: IAttachment[];
  content?: string;
};

type State = {
  key?: string;
  brandId?: string;
  searchValue: string;
  options: IResponseTemplate[];
};

class ResponseTemplate extends React.Component<Props, State> {
  private overlayRef;

  onSelectTemplate = () => {
    this.overlayRef.hide();
  };

  render() {
    const { brands, content, brandId, attachments } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__('Save as template')}>
          <Icon icon="download-3" />
        </Tip>
      </Button>
    );

    const popover = (
      <Popover className="popover-template" id="templates-popover">
        <Popover.Title as="h3">{__('Response Templates')}</Popover.Title>
        <Popover.Content>
          <PopoverContent
            {...this.props}
            onSelectTemplate={this.onSelectTemplate}
          />
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
          <Button btnStyle="link">
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
