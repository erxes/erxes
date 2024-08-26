import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { FlexItem } from "@erxes/ui/src/components/step/styles";
import {
  CAMPAIGN_TARGET_TYPES,
  METHODS,
  BUSINESS_PORTAL_KINDS
} from "@erxes/ui-engage/src/constants";
import { SelectMessageType } from "@erxes/ui-engage/src/styles";
import { ClientPortalConfig } from "@erxes/plugin-clientportal-ui/src/types";
import { EmptyState, Spinner } from "@erxes/ui/src";
import React from "react";
import BrandStep from "../../containers/BrandStep";
import SegmentStep from "../../containers/SegmentStep";
import TagStep from "../../containers/TagStep";

type Props = {
  method?: string;
  clearState: () => void;
  onChange: (
    name: "brandIds" | "tagIds" | "segmentIds" | "cpId",
    value: string[] | string
  ) => void;
  segmentType?: string;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
  clientPortalGetConfigs?: ClientPortalConfig[];
  businessPortalKind?: string;
  handleClientPortalKindChange: (kind: string) => void;
  selectedCpId?: string;
  segmentsTypes?: any[];
};

type State = {
  messageType: string;
  segmentType: string;
  cpId?: string;
};

class MessageTypeStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { brandIds = [], tagIds = [], segmentType } = props;

    let messageType: string = CAMPAIGN_TARGET_TYPES.SEGMENT;

    if (brandIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.BRAND;
    }
    if (tagIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.TAG;
    }

    this.state = { messageType, segmentType: segmentType || "core:lead" };
  }

  onChange = (key, e: React.FormEvent<HTMLElement>) => {
    if (key === "cpId") {
      this.props.onChange(key, (e.target as HTMLInputElement).value);
    } else {
      this.setState({ [key]: (e.target as HTMLInputElement).value } as any);
    }
    this.props.clearState();
  };

  renderBusinessPortalKind() {
    const { method } = this.props;

    if (method !== METHODS.NOTIFICATION) {
      return null;
    }

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Select the type of business portal:</ControlLabel>
          <FormControl
            id="businessPortalKind"
            componentclass="select"
            defaultValue={this.props.businessPortalKind || ""}
            options={[
              { value: "", label: "Select a business portal" },
              ...BUSINESS_PORTAL_KINDS.ALL.map(item => ({
                value: item,
                label: item + " portal"
              }))
            ]}
            onChange={e => {
              this.props.handleClientPortalKindChange(
                (e.target as HTMLInputElement).value
              );
            }}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderBusinessPortalSelector() {
    const { clientPortalGetConfigs, method, businessPortalKind } = this.props;

    if (method !== METHODS.NOTIFICATION) {
      return null;
    }

    if (!clientPortalGetConfigs || clientPortalGetConfigs.length === 0) {
      return (
        <EmptyState
          icon="no-entry"
          text={`No ${businessPortalKind}portal found`}
          size="small"
        />
      );
    }

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Choose a {businessPortalKind}portal:</ControlLabel>
          <FormControl
            id="cpId"
            value={this.state.cpId}
            defaultValue={this.props.selectedCpId || ""}
            componentclass="select"
            options={[
              { value: "", label: `Select a ${businessPortalKind} portal` },
              ...clientPortalGetConfigs.map(item => ({
                value: item._id,
                label: item.name
              }))
            ]}
            onChange={this.onChange.bind(this, "cpId")}
            required
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderSegmentType() {
    const { messageType } = this.state;
    const { method, clientPortalGetConfigs } = this.props;

    if (
      messageType !== CAMPAIGN_TARGET_TYPES.SEGMENT ||
      (method === METHODS.NOTIFICATION && clientPortalGetConfigs?.length === 0)
    ) {
      return null;
    }

    const segmentOptions =
      (this.props.segmentsTypes || []).length > 0
        ? (this.props.segmentsTypes || ([] as any)).map(type => ({
            label: type.description,
            value: type.contentType
          }))
        : [
            { value: "core:lead", label: "Leads" },
            { value: "core:customer", label: "Customers" },
            { value: "core:company", label: "Company contacts" },
            { value: "sales:deal", label: "Deal contacts" },
            { value: "tasks:task", label: "Task contacts" },
            { value: "tickets:ticket", label: "Ticket contacts" },
            { value: "purchases:purchase", label: "Purchase contacts" }
          ];

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Segment type:</ControlLabel>
          <FormControl
            id="segmentType"
            value={this.state.segmentType}
            componentclass="select"
            options={segmentOptions}
            onChange={this.onChange.bind(this, "segmentType")}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderSelector() {
    const { clientPortalGetConfigs, method } = this.props;

    const options = CAMPAIGN_TARGET_TYPES.ALL.map(opt => ({
      value: opt,
      label: opt.split(":")[1]
    }));

    if (
      method === METHODS.NOTIFICATION &&
      clientPortalGetConfigs?.length === 0
    ) {
      return null;
    }

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Choose a message type:</ControlLabel>
          <FormControl
            id="messageType"
            value={this.state.messageType}
            componentclass="select"
            options={options}
            onChange={this.onChange.bind(this, "messageType")}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderContent = ({ actionSelector, selectedComponent, customerCounts }) => {
    const { method, clientPortalGetConfigs } = this.props;

    const renderActionSelector = () => {
      if (
        method === METHODS.NOTIFICATION &&
        clientPortalGetConfigs?.length === 0
      ) {
        return null;
      }
      return actionSelector;
    };

    const renderSelectedComponent = () => {
      if (
        method === METHODS.NOTIFICATION &&
        clientPortalGetConfigs?.length === 0
      ) {
        return null;
      }
      return selectedComponent;
    };

    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          {this.renderBusinessPortalKind()}
          {this.renderBusinessPortalSelector()}
          {this.renderSelector()}
          {this.renderSegmentType()}
          {renderActionSelector()}
          {renderSelectedComponent()}
        </FlexItem>
        <FlexItem direction="column" v="center" h="center">
          {customerCounts}
        </FlexItem>
      </FlexItem>
    );
  };

  stepComponent() {
    let Component;

    switch (this.state.messageType) {
      case CAMPAIGN_TARGET_TYPES.BRAND:
        Component = BrandStep;
        break;
      case CAMPAIGN_TARGET_TYPES.TAG:
        Component = TagStep;
        break;
      default:
        Component = SegmentStep;
        break;
    }

    return Component;
  }

  render() {
    const commonProps = {
      ...this.props,
      messageType: this.state.messageType,
      segmentType: this.state.segmentType,
      cpId: this.state.cpId,
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
