import Button from "@erxes/ui/src/components/Button";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import { __, router } from "@erxes/ui/src/utils";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import ProductForm from "../../containers/product/ProductForm";
// import EmailTemplateForm from '../../../emailTemplates/components/Form';
import ResponseTemplateForm from "../../../responseTemplates/components/Form";
import GrowthHacksTemplateForm from "../../../growthHacks/components/TemplateForm";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { FormControl } from "@erxes/ui/src/components/form";
import { BarItems } from "@erxes/ui/src/layout/styles";

type Props = {
  queryParams: any;
  history: any;
  renderButtonEmailTemplates: (props: IButtonMutateProps) => JSX.Element;
  renderButtonResponseTemplates: (props: IButtonMutateProps) => JSX.Element;
  renderButtonGrowthHackTemplates: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  searchValue?: string;
};
class ActionBar extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      searchValue: "",
    };
  }

  search = (e) => {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const { history } = this.props;
    const searchValue = e.target.value;

    this.setState({ searchValue });

    this.timer = setTimeout(() => {
      router.removeParams(history, "page");
      router.setParams(history, { searchValue });
    }, 500);
  };

  moveCursorAtTheEnd(e) {
    const tmpValue = e.target.value;

    e.target.value = tmpValue;
  }

  render() {
    const triggerProduct = (
      <div style={{ marginLeft: "15px", cursor: "pointer" }}>
        Products & Services
      </div>
    );

    const triggerEmail = (
      <div style={{ marginLeft: "15px", cursor: "pointer" }}>Email</div>
    );

    const triggerResponse = (
      <div style={{ marginLeft: "15px", cursor: "pointer" }}>Chat Response</div>
    );

    const triggerGrowthHacking = (
      <div style={{ marginLeft: "15px", cursor: "pointer" }}>
        Growth Hacking
      </div>
    );

    const modalContent = (props) => <ProductForm {...props} />;

    // const modelContentEmail = props => {
    //   return (
    //     <EmailTemplateForm
    //       {...props}
    //       renderButton={this.props.renderButtonEmailTemplates}
    //     />
    //   );
    // };

    const modelContentResponse = (props) => {
      return (
        <ResponseTemplateForm
          {...props}
          renderButton={this.props.renderButtonResponseTemplates}
        />
      );
    };

    const modelContentGrowthHacks = (props) => {
      return (
        <GrowthHacksTemplateForm
          {...props}
          renderButton={this.props.renderButtonGrowthHackTemplates}
        />
      );
    };

    return (
      <BarItems>
        <FormControl
          type="text"
          placeholder={__("Search")}
          onChange={this.search}
          value={this.state.searchValue}
          autoFocus={true}
          onFocus={this.moveCursorAtTheEnd}
        />

        <Dropdown alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-properties">
            <Button btnStyle="primary">
              {__("Add new template")}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {/* <ModalTrigger
              title="Add new template"
              trigger={triggerEmail}
              autoOpenKey="showProductModal"
              content={modelContentEmail}
              size="lg"
            /> */}
            <ModalTrigger
              title="Add new template"
              trigger={triggerResponse}
              autoOpenKey="showProductModal"
              content={modelContentResponse}
              size="lg"
            />
            <ModalTrigger
              title="Add new template"
              trigger={triggerGrowthHacking}
              autoOpenKey="showProductModal"
              content={modelContentGrowthHacks}
              size="lg"
            />
            <ModalTrigger
              title="Add new template"
              trigger={triggerProduct}
              autoOpenKey="showProductModal"
              content={modalContent}
              size="lg"
            />
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );
  }
}

export default ActionBar;
