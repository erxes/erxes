import {
  InlineColumn,
  InlineHeader,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverList,
  PopoverLoadMore,
  TemplateContent,
  TemplateTitle
} from '@erxes/ui-inbox/src/inbox/styles';

import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IAttachment } from '@erxes/ui/src/types';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import { Link } from 'react-router-dom';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import strip from 'strip';

type Props = {
  brandId?: string;
  searchValue?: string;
  responseTemplates: IResponseTemplate[];
  hasMore: boolean;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  onSearchChange: (name: string, value: string) => void;
  onSelectTemplate: () => void;
  fetchMore: (variables: { perPage: number; page: number }) => void;

  attachments?: IAttachment[];
  brands: IBrand[];
  content?: string;
};

type State = {
  brandId?: string;
  searchValue: string;
  options: IResponseTemplate[];
  cursor: number;
  maxCursor: number;
};

class PopoverContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.searchValue,
      brandId: props.brandId,
      options: props.responseTemplates,
      cursor: 0,
      maxCursor: 0
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleArrowSelection);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleArrowSelection);
  }

  handleArrowSelection = (event: any) => {
    const { cursor } = this.state;

    switch (event.keyCode) {
      case 13:
        const element = document.getElementsByClassName(
          'response-template-' + cursor
        )[0] as HTMLElement;

        if (element) {
          element.click();
        }
        break;
      case 38:
        // Arrow move up
        if (cursor > 0) {
          this.setState({ cursor: cursor - 1 });
        }
        if (cursor === 0) {
          this.setState({ cursor: this.state.maxCursor - 1 });
        }
        break;
      case 40:
        // Arrow move down
        if (cursor < this.state.maxCursor - 1) {
          this.setState({ cursor: cursor + 1 });
        } else {
          this.setState({ cursor: 0 });
        }
        break;
      default:
        break;
    }
  };

  onSelect = (responseTemplateId: string) => {
    const { responseTemplates, onSelect } = this.props;

    // find response template using event key
    const responseTemplate = responseTemplates.find(
      t => t._id === responseTemplateId
    );

    // hide selector
    this.props.onSelectTemplate();

    return onSelect && onSelect(responseTemplate);
  };

  onChangeFilter = (e: React.FormEvent<HTMLElement>, type) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState(({ [type]: value } as unknown) as Pick<State, keyof State>);
  };

  filterByValue(array, value) {
    return array.filter(o =>
      o.name.toLowerCase().includes(value.toLowerCase())
    );
  }
  filterByBrandId(array, value) {
    return array.filter(o => o.brandId === value);
  }

  renderItems() {
    const { responseTemplates } = this.props;
    const { searchValue, brandId } = this.state;

    const filteredByBrandIdTargets =
      brandId === ''
        ? responseTemplates
        : this.filterByBrandId(responseTemplates, brandId);
    const filteredTargets =
      searchValue === ''
        ? filteredByBrandIdTargets
        : this.filterByValue(filteredByBrandIdTargets, searchValue);

    if (this.state.maxCursor !== filteredByBrandIdTargets.length) {
      this.setState({ maxCursor: filteredByBrandIdTargets.length });
    }

    if (filteredTargets.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return filteredTargets.map((item, i) => {
      const onClick = () => this.onSelect(item._id);

      return (
        <li
          key={item._id}
          onClick={onClick}
          className={`response-template-${i} ${this.state.cursor === i &&
            'active'} `}
        >
          <TemplateTitle>{item.name}</TemplateTitle>
          <TemplateContent>{strip(item.content)}</TemplateContent>
        </li>
      );
    });
  }

  renderLoadMore = () => {
    const { hasMore } = this.props;

    if (!hasMore) {
      return;
    }

    return (
      <PopoverLoadMore>
        <Button btnStyle="simple" onClick={this.fetchTemplates}>
          {__('Load more')}
        </Button>
      </PopoverLoadMore>
    );
  };

  fetchTemplates = () => {
    const { responseTemplates = [] } = this.props;

    const perPage = 10;
    const page = Math.round((responseTemplates || []).length / perPage + 1);

    this.props.fetchMore({
      perPage,
      page
    });
  };

  render() {
    const { brands } = this.props;

    const onChangeSearchValue = e => this.onChangeFilter(e, 'searchValue');

    const onChangeBrand = e => this.onChangeFilter(e, 'brandId');

    return (
      <>
        <PopoverHeader>
          <InlineHeader>
            <InlineColumn>
              <FormControl
                type="text"
                placeholder={__('Search') as string}
                onChange={onChangeSearchValue}
                defaultValue={this.state.searchValue}
                autoFocus={true}
              />
            </InlineColumn>
            <InlineColumn>
              <FormControl
                componentClass="select"
                placeholder={__('Select Brand') as string}
                onChange={onChangeBrand}
                defaultValue={this.state.brandId}
              >
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </FormControl>
            </InlineColumn>
          </InlineHeader>
        </PopoverHeader>

        <PopoverBody>
          <PopoverList>
            {this.renderItems()}
            {this.renderLoadMore()}
          </PopoverList>
        </PopoverBody>
        <PopoverFooter>
          <PopoverList center={true}>
            <li>
              <Link to="/settings/response-templates">
                {__('Manage templates')}
              </Link>
            </li>
          </PopoverList>
        </PopoverFooter>
      </>
    );
  }
}

export default PopoverContent;
