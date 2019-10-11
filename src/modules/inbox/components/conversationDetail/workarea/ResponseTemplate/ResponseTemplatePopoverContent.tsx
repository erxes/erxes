import EmptyState from 'modules/common/components/EmptyState';
import FormControl from 'modules/common/components/form/Control';

import { __, Alert } from 'modules/common/utils';
import {
  InlineColumn,
  InlineHeader,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverList,
  TemplateContent,
  TemplateTitle
} from 'modules/inbox/styles';
import React from 'react';

import { Link } from 'react-router-dom';
import strip from 'strip';
import { IAttachment } from '../../../../../common/types';
import { IBrand } from '../../../../../settings/brands/types';
import {
  IResponseTemplate,
  SaveResponsTemplateMutationVariables
} from '../../../../../settings/responseTemplates/types';

type Props = {
  brandId?: string;
  searchValue?: string;
  responseTemplates: IResponseTemplate[];
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  onSearchChange: (name: string, value: string) => void;
  onSelectTemplate: () => void;
  saveResponseTemplate: (
    doc: SaveResponsTemplateMutationVariables,
    callback: (error?: Error) => void
  ) => void;

  attachments?: IAttachment[];
  brands: IBrand[];
  content?: string;
};

type State = {
  brandId?: string;
  searchValue: string;
  options: IResponseTemplate[];
};

class ResponseTemplatePopoverContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.searchValue,
      brandId: props.brandId,
      options: props.responseTemplates
    };
  }

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

  render() {
    const { brands } = this.props;

    const onChangeSearchValue = e => this.onChangeFilter(e, 'searchValue');

    const onChangeBrand = e => this.onChangeFilter(e, 'searchValue');

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
          <PopoverList>{this.renderItems()}</PopoverList>
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

export default ResponseTemplatePopoverContent;
