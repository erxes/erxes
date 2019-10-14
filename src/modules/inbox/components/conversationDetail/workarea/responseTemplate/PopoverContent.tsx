import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';
import { IAttachment } from 'modules/common/types';
import { __ } from 'modules/common/utils';
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
} from 'modules/inbox/styles';
import { IBrand } from 'modules/settings/brands/types';
import { IResponseTemplate } from 'modules/settings/responseTemplates/types';
import React from 'react';
import { Link } from 'react-router-dom';
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
};

class PopoverContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.searchValue,
      brandId: props.brandId,
      options: props.responseTemplates
    };
  }

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

    this.props.onSearchChange(type, value);
  };

  renderItems() {
    const { responseTemplates } = this.props;

    if (responseTemplates.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return responseTemplates.map(item => {
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

  fetchTemplates = () => {
    const { responseTemplates } = this.props;

    const perPage = 10;
    const page = Math.round(responseTemplates.length / perPage + 1);

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
