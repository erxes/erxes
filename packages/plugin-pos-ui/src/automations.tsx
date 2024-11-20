import { DrawerDetail } from "@erxes/ui-automations/src/styles";
import Button from "@erxes/ui/src/components/Button";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { __ } from "@erxes/ui/src/utils/core";
import React from "react";
import { Link } from "react-router-dom";

const Automations = (props) => {
  const { componentType, addConfig, activeTrigger, closeModal, target } =
    props || {};

  if (["historyActionResult", "historyName"].includes(componentType)) {
    return (
      <Link target="_blank" to={`/pos-orders?search=${target?.number}`}>
        {`paid order: ${target.number}`}
      </Link>
    );
  }

  if (componentType === "triggerForm") {
    const onSave = () => {
      addConfig(activeTrigger, activeTrigger.id, {});
      closeModal();
    };

    return (
      <DrawerDetail>
        <EmptyState
          icon={"cell"}
          text="Save this trigger without any additional configuration."
        />
        <Button btnStyle="success" block onClick={onSave}>
          {__("Save")}
        </Button>
      </DrawerDetail>
    );
  }

  return null;
};

export default Automations;
