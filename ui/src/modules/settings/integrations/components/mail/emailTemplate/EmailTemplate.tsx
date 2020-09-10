import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import {
  PopoverBody,
  PopoverList
} from 'modules/common/components/filterableList/styles';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ResponseTemplateStyled as EmailTemplateStyled } from 'modules/inbox/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

type Props = {
  targets: Array<{ value: string; label: string }>;
  onSelect: (id: string) => void;
};

class EmailTemplate extends React.Component<Props> {
  private overlayRef;

  handleClick(value: string) {
    this.props.onSelect(value);
    this.hidePopover();
  }

  hidePopover = () => {
    this.overlayRef.hide();
  };

  renderContent() {
    const { targets = [] } = this.props;

    if (!targets || targets.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    targets.unshift({ value: '', label: 'Clear' });

    return targets.map(item => {
      const onClick = () => this.handleClick(item.value);

      return (
        <li key={item.value} onClick={onClick}>
          {item.label}
        </li>
      );
    });
  }

  render() {
    const popover = (
      <Popover className="popover-template" id="templates-popover">
        <Popover.Title as="h3">{__('Email Templates')}</Popover.Title>
        <Popover.Content>
          <PopoverBody>
            <PopoverList>{this.renderContent()}</PopoverList>
          </PopoverBody>
        </Popover.Content>
      </Popover>
    );

    return (
      <EmailTemplateStyled>
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
            <Tip text={__('Email template')}>
              <Icon icon="file-bookmark-alt" />
            </Tip>
          </Button>
        </OverlayTrigger>
      </EmailTemplateStyled>
    );
  }
}

export default EmailTemplate;
