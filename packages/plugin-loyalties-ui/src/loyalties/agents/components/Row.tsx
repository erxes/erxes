import _ from "lodash";
import Form from "../containers/Form";
import React from "react";
import { FlexItem } from "../../common/styles";
import { formatValue } from "@erxes/ui/src/utils";
import { IQueryParams } from "@erxes/ui/src/types";
import { IAgent } from "../types";
import { ModalTrigger } from "@erxes/ui/src/components";

type Props = {
  agent: IAgent;
  isChecked: boolean;
  toggleBulk: (agent: IAgent, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class AgentRow extends React.Component<Props> {
  displayValue(agent, name) {
    const value = _.get(agent, name);

    if (name === "primaryName") {
      return <FlexItem>{formatValue(agent.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = (e) => {
    const { toggleBulk, agent } = this.props;
    if (toggleBulk) {
      toggleBulk(agent, e.target.checked);
    }
  };

  modalContent = (props) => {
    const { agent } = this.props;

    const updatedProps = {
      ...props,
      agent,
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { agent } = this.props;

    const onClick = (e) => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td key={"number"}>{this.displayValue(agent, "number")}</td>
        <td key={"status"}>{this.displayValue(agent, "status")}</td>
        <td key={"hasReturn"}>{this.displayValue(agent, "hasReturn")}</td>
        <td key={"actions"} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit agent`}
        trigger={trigger}
        autoOpenKey="showAgentModal"
        content={this.modalContent}
      />
    );
  }
}

export default AgentRow;
