import {
  IButtonMutateProps,
  IFieldLogic,
  IFormProps
} from "@erxes/ui/src/types";

import Button from "@erxes/ui/src/components/Button";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IFieldGroup } from "../types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import PropertyLogics from "../containers/PropertyLogics";
import React from "react";
import { RenderDynamicComponent } from "@erxes/ui/src/utils/core";
import { FlexRow, Row } from "../styles";
import Toggle from "@erxes/ui/src/components/Toggle";
import { __ } from "@erxes/ui/src/utils";
import ProductPropertGroupForm from "@erxes/ui-products/src/containers/form/PropertyGroupForm";

type Props = {
  group?: IFieldGroup;
  groups: IFieldGroup[];
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  isMultiple: boolean;
  isVisible: boolean;
  isVisibleInDetail: boolean;
  alwaysOpen: boolean;
  config: any;
  logics?: IFieldLogic[];
  logicAction?: string;
};
class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let isMultiple = false;
    let isVisible = true;
    let isVisibleInDetail = true;
    let alwaysOpen = false;
    let config = {};

    if (props.group) {
      isMultiple = props.group.isMultiple;
      isVisible = props.group.isVisible;
      isVisibleInDetail = props.group.isVisibleInDetail;
      config = props.group.config || {};
      alwaysOpen = props.group.alwaysOpen;

      // Pre-populate fieldVisibility for system groups from each field's
      // isVisibleToCreate so saving without clicking a toggle persists defaults.
      if (
        props.group.isDefinedByErxes &&
        !config.fieldVisibility &&
        props.group.fields?.length
      ) {
        const fieldVisibility: Record<string, boolean> = {};
        for (const field of props.group.fields) {
          fieldVisibility[field._id] = !!field.isVisibleToCreate;
        }
        config = { ...config, fieldVisibility };
      }
    }

    this.state = {
      config,
      isMultiple,
      isVisible,
      isVisibleInDetail,
      alwaysOpen,
      logics: props.group && props.group.logics ? props.group.logics : [],
      logicAction: props.group && props.group.logicAction
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
    logicAction: string;
    logics: IFieldLogic[];
  }) => {
    const { group, type } = this.props;
    const finalValues = values;
    const config = this.state.config;

    const { logicAction, logics } = this.state;

    if (group) {
      finalValues._id = group._id;

      // For system-defined groups preserve existing identity fields
      if (group.isDefinedByErxes) {
        finalValues.name = group.name;
        finalValues.description = group.description || "";
      }
    }

    return {
      ...finalValues,
      contentType: type,
      isMultiple: this.state.isMultiple,
      isVisible: this.state.isVisible,
      isVisibleInDetail: this.state.isVisibleInDetail,
      alwaysOpen: this.state.alwaysOpen,
      config,
      logicAction,
      logics
    };
  };

  multipleHandler = e => {
    if (e.target.id === "multiple") {
      const isMultiple = e.target.checked;

      return this.setState({ isMultiple });
    }
  };

  alwaysOpenHandler = e => {
    if (e.target.id === "alwaysOpen") {
      const alwaysOpen = e.target.checked;

      return this.setState({ alwaysOpen });
    }
  };

  visibleHandler = e => {
    if (e.target.id === "visible") {
      const isVisible = e.target.checked;

      return this.setState({ isVisible });
    }

    const isVisibleInDetail = e.target.checked;

    return this.setState({ isVisibleInDetail });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return null;
    }

    const Checked = () => <span>And</span>;
    const UnChecked = () => <span>Or</span>;

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            id="visible"
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{ checked: <Checked />, unchecked: <UnChecked /> }}
          />
        </div>
      </FormGroup>
    );
  }

  renderFieldVisibleInDetail() {
    if (!this.props.group) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible in detail</ControlLabel>
        <div>
          <Toggle
            id="visibleDetail"
            checked={this.state.isVisibleInDetail}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  onChangeItems = (boardsPipelines: any, key?: string) => {
    if (key) {
      this.setState(prev => ({
        config: { ...prev.config, [key]: boardsPipelines }
      }));
      return;
    }

    this.setState(prev => ({
      config: { ...prev.config, boardsPipelines }
    }));
  };

  onFieldVisibilityChange = (fieldId: string, value: boolean) => {
    this.setState(prev => ({
      config: {
        ...prev.config,
        fieldVisibility: {
          ...(prev.config?.fieldVisibility || {}),
          [fieldId]: value
        }
      }
    }));
  };

  renderFieldVisibilitySection() {
    const { group } = this.props;

    if (!group || !group.isDefinedByErxes || !group.fields?.length) {
      return null;
    }

    const fieldVisibility: Record<string, boolean> =
      this.state.config?.fieldVisibility || {};

    return (
      <FormGroup>
        <ControlLabel>{__("Field Visibility to Create")}</ControlLabel>
        <p>
          {__(
            "Choose which fields appear in the create form for the configured pipelines."
          )}
        </p>
        {group.fields.map(field => {
            const isChecked =
              fieldVisibility[field._id] !== undefined
                ? fieldVisibility[field._id]
                : !!field.isVisibleToCreate;

            return (
              <FlexRow key={field._id} style={{ marginBottom: 8 }}>
                <span style={{ flex: 1 }}>{field.text}</span>
                <Toggle
                  id={`fv_${field._id}`}
                  checked={isChecked}
                  icons={{
                    checked: <span>{__("Yes")}</span>,
                    unchecked: <span>{__("No")}</span>
                  }}
                  onChange={e =>
                    this.onFieldVisibilityChange(field._id, e.target.checked)
                  }
                />
              </FlexRow>
            );
          })}
      </FormGroup>
    );
  }

  onChangeLogicAction = value => {
    this.setState({ logicAction: value });
  };

  onChangeLogics = logics => {
    this.setState({ logics });
  };

  renderExtraContent() {
    const { type } = this.props;
    const { config } = this.state;

    if (type === "core:product") {
      return (
        <ProductPropertGroupForm
          config={config}
          onChangeItems={this.onChangeItems}
        />
      );
    }

    const plugins: any[] = (window as any).plugins || [];

    for (const plugin of plugins) {
      if (type.includes(`${plugin.name}:`) && plugin.propertyGroupForm) {
        return (
          <RenderDynamicComponent
            scope={plugin.scope}
            component={plugin.propertyGroupForm}
            injectedProps={{
              config,
              type,
              onChangeItems: this.onChangeItems
            }}
          />
        );
      }
    }

    return null;
  }

  renderContent = (formProps: IFormProps) => {
    const { group, groups, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const object = group || ({} as IFieldGroup);

    // For system-defined groups, only allow board & pipeline + field visibility configuration
    if (group && group.isDefinedByErxes) {
      return (
        <>
          {this.renderExtraContent()}
          {this.renderFieldVisibilitySection()}
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
              Close
            </Button>
            {renderButton({
              name: "property group",
              values: this.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object: group
            })}
          </ModalFooter>
        </>
      );
    }

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            required={true}
            defaultValue={object.name}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required={true}
            defaultValue={object.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl {...formProps} name="code" defaultValue={object.code} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Parent group:</ControlLabel>
          <Row>
            <FormControl
              {...formProps}
              name="parentId"
              componentclass="select"
              defaultValue={object.parentId || null}
            >
              <option value="" />
              {groups
                .filter(e => !e.isDefinedByErxes)
                .map(g => {
                  return (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  );
                })}
            </FormControl>
          </Row>
        </FormGroup>

        {this.renderFieldVisible()}
        {this.renderExtraContent()}

        {["visitor", "lead", "customer"].includes(object.contentType) ? (
          this.renderFieldVisibleInDetail()
        ) : (
          <></>
        )}

        <FormGroup>
          <ControlLabel>{__("Always open")} </ControlLabel>
          <p>{__("Whether this group is always open in a sidebar")}</p>
          <div>
            <Toggle
              id="alwaysOpen"
              checked={this.state.alwaysOpen}
              onChange={this.alwaysOpenHandler}
              icons={{
                checked: <span>Checked</span>,
                unchecked: <span>Unchecked</span>
              }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Multiple</ControlLabel>
          <div>
            <Toggle
              id="multiple"
              checked={this.state.isMultiple}
              onChange={this.multipleHandler}
              icons={{
                checked: <span>Checked</span>,
                unchecked: <span>Unchecked</span>
              }}
            />
          </div>
        </FormGroup>

        <CollapseContent title={__("Logic")} compact={true}>
          <PropertyLogics
            contentType={this.props.type}
            logics={this.state.logics || []}
            action={this.state.logicAction || "show"}
            onLogicsChange={this.onChangeLogics}
            onActionChange={this.onChangeLogicAction}
          />
        </CollapseContent>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Close
          </Button>

          {renderButton({
            name: "property group",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: group
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PropertyGroupForm;
