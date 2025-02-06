import { BackIcon, DrawerDetail } from "@erxes/ui-automations/src/styles";
import { Features, TriggerItem, TriggersList } from "../../styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import DirectMessageForm from "./DirectMessage";
import FormControl from "@erxes/ui/src/components/form/Control";
import Icon from "@erxes/ui/src/components/Icon";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import PersistentMenu from "./PersistentMenu";
import { __ } from "@erxes/ui/src/utils/core";
import colors from "@erxes/ui/src/styles/colors";

type Props = {
  triggerConst: { conditions: any[]; botId: string };
  onSave: (condition: any) => void;
  onCancel: () => void;
  config: any;
};
``;

function EditForm({
  triggerConst: { conditions: conditionsConst = [] },
  onSave,
  onCancel,
  config: { conditions: conditionsConfig = [], botId }
}: Props) {
  const [conditions, setConditions] = useState(conditionsConfig);
  const [activeItem, setActiveItem] = useState("");

  const onChangeCondtion = (type, condition) => {
    if (conditions.find((cond) => cond.type === type)) {
      const updatedConditions = conditions.map((cond) =>
        cond.type === type ? { ...cond, ...condition } : cond
      );
      return setConditions(updatedConditions);
    }

    setConditions([...conditions, { type, ...condition }]);
  };

  const renderConditionForm = (type, config, onChange) => {
    const updatedProps = {
      ...config,
      onChange
    };
    switch (type) {
      case "direct":
        return <DirectMessageForm {...updatedProps} />;
      case "persistentMenu":
        return (
          <PersistentMenu
            {...updatedProps}
            botId={botId}
          />
        );

      default:
        return null;
    }
  };

  const renderDetail = ({ type, condition }) => {
    if (activeItem === type) {
      const handleSave = () => {
        setActiveItem("");
      };

      const onChange = (name, value) => {
        onChangeCondtion(type, { ...condition, [name]: value });
      };

      return (
        <DrawerDetail>
          <BackIcon onClick={() => setActiveItem("")}>
            <Icon
              icon='angle-left'
              size={20}
            />{" "}
            {__("Back to conditions")}
          </BackIcon>
          {renderConditionForm(type, condition, onChange)}
          <Button
            size='small'
            btnStyle='success'
            onClick={handleSave}
            block>
            {__("Save")}
          </Button>
        </DrawerDetail>
      );
    }
    return null;
  };

  const renderCondition = ({ type, label, description, icon }, condition) => {
    if (!!activeItem) {
      return renderDetail({ type, condition });
    }

    const handleClick = (e) => {
      if (type === "getStarted") {
        return;
      }

      setActiveItem(!activeItem ? type : "");
    };

    const handleCheck = (isSelected) => {
      onChangeCondtion(type, { ...condition, isSelected });
    };

    const isDisabled =
      !["getStarted", "direct"].includes(type) &&
      !Object.keys(condition).length;

    return (
      <div key={type}>
        <TriggerItem>
          <FormControl
            color={colors.colorCoreBlue}
            componentclass='radio'
            checked={condition?.isSelected}
            onClick={() => handleCheck(!condition?.isSelected)}
            disabled={isDisabled}
          />
          <Icon icon={icon} />
          <div onClick={handleClick}>
            <label>{label}</label>
            <p>{description}</p>
          </div>
        </TriggerItem>
      </div>
    );
  };

  return (
    <>
      <Features isToggled={botId}>
        {!activeItem && <ControlLabel>Triggers</ControlLabel>}
        <TriggersList>
          {conditionsConst.map((conditionConst) => {
            const conditionConfig =
              conditions.find(
                (condition) => condition.type === conditionConst.type
              ) || {};

            return renderCondition(conditionConst, conditionConfig);
          })}
        </TriggersList>
      </Features>
      {!activeItem && (
        <ModalFooter>
          <Button
            btnStyle='simple'
            onClick={onCancel}>
            {__("Cancel")}
          </Button>
          <Button
            btnStyle='success'
            onClick={() => onSave(conditions)}>
            {__("Save")}
          </Button>
        </ModalFooter>
      )}
    </>
  );
}

export default EditForm;
