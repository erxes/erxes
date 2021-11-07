import {
  FormGroup,
  ControlLabel,
  Button,
  Icon,
  Tip,
  ModalTrigger,
  __,
} from "erxes-ui";
import { LeftItem } from "erxes-ui/lib/components/step/styles";
import React from "react";
import {
  ActionButtons,
  Description,
  FlexColumn,
  FlexItem,
  Block,
  BlockRow,
} from "../../../styles";
import Select from "react-select-plus";
import { IPos, IProductGroup, IProductShema } from "../../../types";
import GroupForm from "../../containers/productGroup/GroupForm";

type Props = {
  onChange: (name: "pos" | "description" | "groups", value: any) => void;
  pos?: IPos;
  groups: IProductGroup[];
  productSchemas: IProductShema[];
};

type State = {
  groups: IProductGroup[];
  currentMode: "create" | "update" | undefined;
};

class OptionsStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      groups: this.props.groups,
      currentMode: undefined,
    };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onSubmitGroup = (group: IProductGroup) => {
    const { groups } = this.state;

    const index = groups.findIndex((e) => e._id === group._id);

    if (index !== -1) {
      groups[index] = group;
    } else {
      groups.push(group);
    }

    this.onChangeFunction("groups", groups);
  };

  renderFormTrigger(trigger: React.ReactNode, group?: IProductGroup) {
    const content = (props) => (
      <GroupForm {...props} group={group} onSubmit={this.onSubmitGroup} />
    );

    const title = group ? "Edit group" : "Add group";

    return <ModalTrigger title={title} trigger={trigger} content={content} />;
  }

  renderEditAction(group: IProductGroup) {
    const trigger = (
      <Button btnStyle="link" style={{ float: "right" }}>
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, group);
  }

  renderRemoveAction(group: IProductGroup) {
    const remove = () => {
      let { groups } = this.state;

      groups = groups.filter((e) => e._id !== group._id);

      this.setState({ groups });
      this.onChangeFunction("groups", groups);
    };
    return (
      <Button btnStyle="link" onClick={remove} style={{ float: "right" }}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderGroup(group) {
    return (
      <FormGroup key={group._id}>
        <BlockRow>
          <ControlLabel>
            {group.name}
            <Description>{group.description}</Description>
          </ControlLabel>
          <ActionButtons>
            {this.renderEditAction(group)}
            {this.renderRemoveAction(group)}
          </ActionButtons>
        </BlockRow>
      </FormGroup>
    );
  }

  render() {
    const { pos, productSchemas, groups } = this.props;

    const onChangeDetail = (options) => {
      pos.productDetails = options.map((e) => e.value);
      this.onChangeFunction("pos", pos);
    };

    const productDetails = pos ? pos.productDetails || [] : [];

    const trigger = (
      <Button btnStyle="primary" icon="plus-circle">
        Add group
      </Button>
    );

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__("Default Settings")}</h4>
              <FormGroup>
                <ControlLabel>Product Details</ControlLabel>
                <Description>
                  Select pos to display in the product card.
                </Description>
                <Select
                  options={productSchemas.map((e) => ({
                    label: e.label,
                    value: e.name,
                  }))}
                  value={productDetails}
                  onChange={onChangeDetail}
                  multi={true}
                />
              </FormGroup>
            </Block>
            <Block>
              <h4>{__("Product Groups")}</h4>
              <FormGroup>
                {groups.map((group) => this.renderGroup(group))}
              </FormGroup>

              {this.renderFormTrigger(trigger)}
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default OptionsStep;
