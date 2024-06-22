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
} from "@erxes/ui-inbox/src/inbox/styles";

import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IAttachment } from "@erxes/ui/src/types";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IResponseTemplate } from "../../../../../settings/responseTemplates/types";
import { Link } from "react-router-dom";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";
import strip from "strip";

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
    perPage: number
  ) => void;
};

type State = {
  brandId?: string;
  searchValue: string;
  options: IResponseTemplate[];
  timer: NodeJS.Timer | undefined;
};

class PopoverContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      searchValue: props.searchValue,
      brandId: props.brandId,
      options: props.responseTemplates,
      timer: undefined,
    };
  }

  onSelect = (responseTemplateId: string) => {
    const { responseTemplates, onSelect } = this.props;

    // find response template using event key
    const responseTemplate = responseTemplates.find(
      (t) => t._id === responseTemplateId
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
      o.name.toLowerCase().includes(value.toLowerCase())
    );
  }
  filterByBrandId(array, value) {
    return array.filter((o) => o.brandId === value);
  }

  renderItems() {
    const { responseTemplates } = this.props;

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
          {__("Load more")}
        </Button>
      </PopoverLoadMore>
    );
  };

  fetchTemplates = () => {
    const { responseTemplates = [] } = this.props;

    const perPage = 10;
    const page = Math.round((responseTemplates || []).length / perPage + 1);

    const searchValue = this.state.searchValue || "";
    undefined;
    const brandId = this.state.brandId || "";

    this.props.refetchResponseTemplates(searchValue, brandId, page, perPage);
  };

  render() {
    const { brands } = this.props;

    const onChangeSearchValue = (e) => {
      const searchValue = e.target.value;

      const textContent = searchValue.toLowerCase().replace(/<[^>]+>/g, "");
      if (textContent) {
        const { timer } = this.state;

        if (timer) {
          clearTimeout(timer);
          this.setState({ timer: undefined });
        }

        this.setState({
          timer: setTimeout(() => {
            this.props.refetchResponseTemplates(textContent, "", 1, 20);
          }, 1000),
        });
      }
      this.setState({ searchValue });
    };

    const onChangeBrand = (e) => {
      const brandId = e.target.value;
      this.setState({ brandId });
      this.props.refetchResponseTemplates("", brandId, 1, 20);
    };
    return (
      <>
        <PopoverHeader>
          <InlineHeader>
            <InlineColumn>
              <FormControl
                type="text"
                placeholder={__("Search") as string}
                onChange={onChangeSearchValue}
                defaultValue={this.state.searchValue}
                autoFocus={true}
              />
            </InlineColumn>
            <InlineColumn>
              <FormControl
                componentclass="select"
                placeholder={__("Select Brand") as string}
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
                {__("Manage templates")}
              </Link>
            </li>
          </PopoverList>
        </PopoverFooter>
      </>
    );
  }
}

export default PopoverContent;
