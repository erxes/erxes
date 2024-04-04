import {
  PopoverBody,
  PopoverFooter,
  PopoverList
} from '@erxes/ui/src/components/filterableList/styles';

import Button from '@erxes/ui/src/components/Button';
import { ResponseTemplateStyled as EmailTemplateStyled } from '@erxes/ui-inbox/src/inbox/styles';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { PopoverLinkWrapper } from '../styles';
import React from 'react';
import { SearchInput } from '../../../styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  fetchMoreEmailTemplates: (page: number) => void;
  emailTemplates: Array<{ value: string; label: string }>;
  onSelect: (id: string) => void;
  onSearch: (searchValue: string) => void;
  totalCount?: number;
  history: any;
  loading?: boolean;
};

type State = {
  page: number;
};

class EmailTemplate extends React.Component<Props, State> {
  private overlayRef;

  constructor(props) {
    super(props);

    this.state = {
      page: 1
    };
  }

  onSearch = e => {
    return this.props.onSearch(e ? e.target.value : '');
  };

  onLoadMore = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.props.fetchMoreEmailTemplates(this.state.page);
      }
    );
  };

  handleClick = (value: string) => {
    this.props.onSelect(value);
    this.hidePopover();
  };

  hidePopover = () => {
    this.overlayRef.hide();
  };

  renderContent() {
    const { emailTemplates = [] } = this.props;

    if (!emailTemplates || emailTemplates.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return emailTemplates.map(item => (
      <li key={item.value} onClick={() => this.handleClick(item.value)}>
        {item.label}
      </li>
    ));
  }

  renderLoadMore() {
    const { totalCount, emailTemplates = [], loading } = this.props;

    if (
      totalCount === (emailTemplates || []).length ||
      (emailTemplates || []).length < 20
    ) {
      return null;
    }

    return (
      <Button
        block={true}
        btnStyle="link"
        onClick={this.onLoadMore}
        icon="redo"
        uppercase={false}
      >
        {loading ? 'Loading...' : 'Load more'}
      </Button>
    );
  }

  render() {
    const popover = (
      <Popover id="templates-popover">
        <Popover.Title as="h3">{__('Email Templates')}</Popover.Title>
        <Popover.Content>
          <PopoverBody>
            <SearchInput>
              <FormControl
                type="text"
                placeholder={__('Type to search')}
                onChange={this.onSearch}
              />
            </SearchInput>
            <PopoverList>
              {this.renderContent()}
              {this.renderLoadMore()}
            </PopoverList>
          </PopoverBody>
          <PopoverFooter>
            <PopoverLinkWrapper>
              <Link to="/settings/email-templates">
                <Icon icon="cog" />
                {__('Manage email templates')}
              </Link>
            </PopoverLinkWrapper>
          </PopoverFooter>
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
