import _ from "lodash";
import Form from "../containers/Form";
import React from "react";
import { FlexItem } from "../../common/styles";
import { formatValue } from "@erxes/ui/src/utils";
import { IQueryParams } from "@erxes/ui/src/types";
import { IAgentDocument } from "../types";
import { ActionButtons, Button, ModalTrigger, Tip } from "@erxes/ui/src/components";

type Props = {
  agent: IAgentDocument;
  queryParams: IQueryParams;
  removeAgent: (_id: string) => void;
};

class AgentRow extends React.Component<Props> {
  displayValue(agent, name) {
    const value = _.get(agent, name);

    if (name === "primaryName") {
      return <FlexItem>{formatValue(agent.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  modalContent = (props) => {
    const { agent } = this.props;

    const updatedProps = {
      ...props,
      agent,
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { agent, removeAgent } = this.props;

    const onClick = (e) => {
      e.stopPropagation();
    };

    const productRuleNames = (agent.rulesOfProducts || []).map(p => `${p.name}, `);

    const remove = () => {
      removeAgent(agent._id);
    };

    const trigger = (
      <tr>
        <td key="number">{this.displayValue(agent, "number")}</td>
        <td key="status">{this.displayValue(agent, "status")}</td>
        <td key="hasReturn">{this.displayValue(agent, "hasReturn")}</td>
        <td key="productRules">{productRuleNames}</td>
        <td key="actions" onClick={onClick}>
          <ActionButtons>
            <Tip text="Delete" placement="bottom">
              <Button btnStyle="link" onClick={remove} icon="cancel-1" />
            </Tip>
          </ActionButtons>
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
