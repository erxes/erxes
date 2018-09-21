import {
  Button,
  EmptyState,
  FormControl,
  Icon,
  Tip
} from "modules/common/components";
import { __, Alert } from "modules/common/utils";
import {
  InlineColumn,
  InlineHeader,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  PopoverList,
  ResponseTemplateStyled,
  TemplateContent,
  TemplateTitle
} from "modules/inbox/styles";
import * as React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Link } from "react-router-dom";
import strip from "strip";
import { IBrand } from "../../../../settings/brands/types";
import { IResponseTemplate } from "../../../../settings/responseTemplates/types";
import ResponseTemplateModal from "./ResponseTemplateModal";

type Props = {
  brandId?: string;
  responseTemplates: IResponseTemplate[];
  onSelect?: (responseTemplate) => void;
  saveResponseTemplate: (doc, callback) => void;
  attachments?: any;
  brands: IBrand[];
  content?: string;
};

type State = {
  key?: string;
  brandId?: string;
  options: IResponseTemplate[];
};

class ResponseTemplate extends React.Component<Props, State> {
  private overlayRef;

  constructor(props) {
    super(props);

    this.state = {
      key: "",
      brandId: props.brandId,
      options: this.filterByBrand(props.brandId)
    };

    this.overlayRef = React.createRef();

    this.onSelect = this.onSelect.bind(this);
    this.onSave = this.onSave.bind(this);
    this.filterItems = this.filterItems.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.filterByBrand = this.filterByBrand.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { brandId } = this.props;

    if (prevProps.brandId !== this.props.brandId) {
      const newState: State = {
        options: this.filterByBrand(this.props.brandId)
      };

      if (brandId) {
        newState.brandId = brandId;
      }

      this.setState(newState);
    }
  }

  onSave(brandId, name) {
    const doc = {
      brandId,
      name,
      content: this.props.content,
      files: this.props.attachments
    };

    this.props.saveResponseTemplate(doc, error => {
      if (error) return Alert.error(error.message);

      Alert.success("Congrats");

      const element = document.querySelector("button.close") as HTMLElement;

      return element.click();
    });
  }

  onSelect(eventKey) {
    const { responseTemplates, onSelect } = this.props;

    // find response template using event key
    const responseTemplate = responseTemplates.find(t => t._id === eventKey);

    // hide selector
    this.overlayRef.hide();

    return onSelect && onSelect(responseTemplate);
  }

  onFilter(e) {
    const options = this.filterByBrand(e.target.value);
    this.setState({ options, brandId: e.target.value });
  }

  filterByBrand(brandId) {
    return this.props.responseTemplates.filter(
      option => option.brandId === brandId
    );
  }

  filterItems(e) {
    this.setState({ key: e.target.value });
  }

  renderItems() {
    const { options, key } = this.state;

    if (options.length === 0) {
      return <EmptyState icon="clipboard-1" text="No templates" />;
    }

    return options.map(item => {
      // filter items by key
      if (
        key &&
        item.name.toLowerCase().indexOf(key) < 0 &&
        (key && item.content.toLowerCase().indexOf(key) < 0)
      ) {
        return false;
      }

      return (
        <li key={item._id} onClick={() => this.onSelect(item._id)}>
          <TemplateTitle>{item.name}</TemplateTitle>
          <TemplateContent>{strip(item.content)}</TemplateContent>
        </li>
      );
    });
  }

  render() {
    const { brands, content, brandId } = this.props;

    const saveTrigger = (
      <Button id="response-template-handler" btnStyle="link">
        <Tip text={__("Save as template")}>
          <Icon icon="download-3" />
        </Tip>
      </Button>
    );

    const popover = (
      <Popover
        className="popover-template"
        id="templates-popover"
        title={__("Response Templates")}
      >
        <PopoverHeader>
          <InlineHeader>
            <InlineColumn>
              <FormControl
                type="text"
                placeholder={__("Search") as string}
                onChange={this.filterItems}
                autoFocus
              />
            </InlineColumn>
            <InlineColumn>
              <FormControl
                componentClass="select"
                placeholder={__("Select Brand") as string}
                onChange={this.onFilter}
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
          <PopoverList center>
            <li>
              <Link to="/settings/response-templates">
                {__("Manage templates")}
              </Link>
            </li>
          </PopoverList>
        </PopoverFooter>
      </Popover>
    );

    return (
      <ResponseTemplateStyled>
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
          rootClose
          ref={overlayTrigger => {
            this.overlayRef = overlayTrigger;
          }}
        >
          <Button btnStyle="link">
            <Tip text={__("Response template")}>
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
