import {
  InlineColumn,
  InlineHeader,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverList,
  PopoverLoadMore,
  TemplateContent,
  TemplateTitle,
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
  attachments?: IAttachment[];
  brands: IBrand[];
  content?: string;
  refetchResponseTemplates: (
    content: string,
    brandId: string,
    page: number,
    perPage: number,
  ) => void;
};

type State = {
  brandId?: string;
  searchValue: string;
  options: IResponseTemplate[];
};

class PopoverContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.searchValue,
      brandId: props.brandId,
      options: props.responseTemplates,
    };
  }

  onSelect = (responseTemplateId: string) => {
    const { responseTemplates, onSelect } = this.props;

    // find response template using event key
    const responseTemplate = responseTemplates.find(
      (t) => t._id === responseTemplateId,
    );

    // hide selector
    this.props.onSelectTemplate();

    return onSelect && onSelect(responseTemplate);
  };

  onChangeFilter = (e: React.FormEvent<HTMLElement>, type) => {
    const { value } = e.currentTarget as HTMLInputElement;

    this.setState({ [type]: value } as unknown as Pick<State, keyof State>);
  };

  filterByValue(array, value) {
    return array.filter((o) =>
      o.name.toLowerCase().includes(value.toLowerCase()),
    );
  }
  filterByBrandId(array, value) {
    return array.filter((o) => o.brandId === value);
  }

  renderItems() {
    const { responseTemplates } = this.props;
    console.log(responseTemplates, 'responseTemplates');

    if (responseTemplates.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return responseTemplates.map((item, i) => {
      const onClick = () => this.onSelect(item._id);

      return (
        <li key={item._id} onClick={onClick}>
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
  // Assuming this is inside a React component
  fetchTemplates = () => {
    const { responseTemplates = [] } = this.props;

    const perPage = 10;
    const page = Math.round((responseTemplates || []).length / perPage + 1);

    // Ensure searchValue and brandId are not undefined before passing them to the function
    const searchValue = this.state.searchValue || ''; // Providing a default value if it's undefined
    const brandId = this.state.brandId || ''; // Providing a default value if it's undefined

    // Call refetchResponseTemplates with the necessary parameters
    this.props.refetchResponseTemplates(searchValue, brandId, page, perPage);
  };

  render() {
    const { brands } = this.props;

    const onChangeSearchValue = (e) => {
      const searchValue = e.target.value; // Assuming searchValue is extracted from the event
      this.setState({ searchValue }); // Update the state with the new searchValue
      this.props.refetchResponseTemplates(searchValue, '', 1, 20);
    };

    const onChangeBrand = (e) => {
      const brandId = e.target.value; // Assuming brandId is extracted from the event
      this.setState({ brandId }); // Update the state with the new brandId
      this.props.refetchResponseTemplates('', brandId, 1, 20);
    };
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
                {brands.map((brand) => (
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
