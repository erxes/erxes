import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import {
  PopoverBody,
  PopoverFooter,
  PopoverList
} from 'modules/common/components/filterableList/styles';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ResponseTemplateStyled as EmailTemplateStyled } from 'modules/inbox/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { CenterContent } from 'modules/common/styles/main';
import { Link } from 'react-router-dom';
import { PopoverLinkWrapper } from '../styles';
import { SearchInput } from '../../store/styles';

type Props = {
  fetchMoreEmailTemplates: (page: number) => void;
  targets: Array<{ value: string; label: string }>;
  onSelect: (id: string) => void;
  totalCount?: number;
};

type State = {
  page: number;
  searchValue: string;
};

class EmailTemplate extends React.Component<Props, State> {
  private overlayRef;

  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      searchValue: ''
    };
  }

  onSearch = e => {
    const searchValue = e.target.value.toLowerCase();
    this.setState({ searchValue });
  };

  handleFetch = () => {
    this.setState(
      {
        page: this.state.page + 1
      },
      () => {
        this.props.fetchMoreEmailTemplates(this.state.page);
      }
    );
  };

  handleClick(value: string) {
    this.props.onSelect(value);
    this.hidePopover();
  }

  hidePopover = () => {
    this.overlayRef.hide();
  };

  filterByValue(array, value) {
    return array.filter(o =>
      o.label.toLowerCase().includes(value.toLowerCase())
    );
  }

  renderContent() {
    const { targets = [] } = this.props;
    const { searchValue } = this.state;

    const filteredTargets =
      searchValue === '' ? targets : this.filterByValue(targets, searchValue);

    if (!filteredTargets || filteredTargets.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return filteredTargets.map(item => {
      const onClick = () => this.handleClick(item.value);

      return (
        <li key={item.value} onClick={onClick}>
          {item.label}
        </li>
      );
    });
  }

  renderLoadMore() {
    const { totalCount, targets } = this.props;

    if (totalCount === targets.length - 1 || targets.length < 20) {
      return null;
    }

    return (
      <CenterContent>
        <Button
          size="small"
          btnStyle="primary"
          onClick={this.handleFetch}
          icon="angle-double-down"
        >
          Load More
        </Button>
      </CenterContent>
    );
  }

  render() {
    const popover = (
      <Popover id="templates-popover">
        <Popover.Title as="h3">{__('Email Templates')}</Popover.Title>
        <Popover.Content>
          <PopoverBody>
            <SearchInput isInPopover={true}>
              <Icon icon="search-1" />
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
