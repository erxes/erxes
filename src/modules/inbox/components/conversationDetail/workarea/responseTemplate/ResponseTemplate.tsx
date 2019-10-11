import Button from 'modules/common/components/Button';

import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __, Alert } from 'modules/common/utils';
import { ResponseTemplateStyled } from 'modules/inbox/styles';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import strip from 'strip';
import { IAttachment } from 'modules/common/types';
import { IBrand } from 'modules/settings/brands/types';
import {
  IResponseTemplate,
  SaveResponsTemplateMutationVariables
} from 'modules/settings/responseTemplates/types';
import ResponseTemplateModal from './Modal';

import PopoverContent from 'modules/inbox/containers/conversationDetail/responseTemplate/PopoverContent';

type Props = {
  brandId?: string;
  saveResponseTemplate: (
    doc: SaveResponsTemplateMutationVariables,
    callback: (error?: Error) => void
  ) => void;
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

  onSave = (brandId: string, name: string) => {
    const doc = {
      brandId,
      name,
      content: this.props.content,
      files: this.props.attachments
    };

    this.props.saveResponseTemplate(doc, error => {
      if (error) {
        return Alert.error(error.message);
      }

      Alert.success('You successfully saved a response template');

      const element = document.querySelector('button.close') as HTMLElement;

      return element.click();
    });
  };

  onSelectTemplate = () => {
    this.overlayRef.hide();
  };

  render() {
    const { brands, content, brandId } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__('Save as template')}>
          <Icon icon="download-3" />
        </Tip>
      </Button>
    );

    const popover = (
      <Popover
        className="popover-template"
        id="templates-popover"
        title={__('Response Templates')}
      >
        <PopoverContent
          {...this.props}
          onSelectTemplate={this.onSelectTemplate}
        />
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
              <Icon icon="clipboard-1" />
            </Tip>
          </Button>
        </OverlayTrigger>

        <ResponseTemplateModal
          trigger={strip(content) ? saveTrigger : <span />}
          brands={brands}
          brandId={brandId}
          onSave={this.onSave}
        />
      </ResponseTemplateStyled>
    );
  }
}

export default ResponseTemplate;
