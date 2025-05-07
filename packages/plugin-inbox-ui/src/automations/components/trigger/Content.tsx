import React from "react";
import { TriggerItem } from "../../styles";
import PersistentMenu from "./PersistentMenu";
import { Column, Flex, MenuDivider } from "@erxes/ui/src/styles/main";
import { CustomChip, OPERATOR_TYPES } from "./DirectMessage";
import { colors } from "@erxes/ui/src/styles";
import { __ } from "@erxes/ui/src/utils/core";

const renderDirectMessageContent = ({ conditions }) => {
  if (!conditions?.length) {
    return null;
  }

  return (
    <Column>
      {conditions.map((cond, i) => {
        const operator = OPERATOR_TYPES.find(
          ({ value }) => value === cond.operator
        );
        return (
          <div key={cond._id}>
            {i !== 0 && <CustomChip>{__("Or")}</CustomChip>}
            <Flex>
              <p>{`${operator?.label}:`}</p>
              <span style={{ color: colors.colorPrimary }}>
                {(cond?.keywords || []).map(({ text }) => text).join(",")}
              </span>
            </Flex>
          </div>
        );
      })}
    </Column>
  );
};

const MessagesContent = ({ constant, config }) => {
  const { conditions, botId } = config || {};
  const { conditions: conditionsConstant } = constant || {};

  const renderPersistentMenuContent = ({ persistentMenuIds }) => {
    return (
      <PersistentMenu
        botId={botId}
        onChange={() => {}}
        persistentMenuIds={persistentMenuIds}
        displaySelectedContent
      />
    );
  };

  const renderConditionContent = (type, cond) => {
    switch (type) {
      case "persistentMenu":
        return renderPersistentMenuContent(cond);
      case "direct":
        return renderDirectMessageContent(cond);
      default:
        return null;
    }
  };

  return (conditions || []).map((cond) => {
    if (!cond.isSelected) {
      return null;
    }

    const { label, description } =
      (conditionsConstant || []).find((c) => c.type === cond.type) || {};
    return (
      <TriggerItem
        key={cond.type}
        small
        withoutHover>
        <div>
          <label>{label}</label>
          <p>{description}</p>
          <MenuDivider />
          {renderConditionContent(cond.type, cond)}
        </div>
      </TriggerItem>
    );
  });
};

export default function TriggerContent({ triggerType, constant, config = {} }) {
  const updatedProps = {
    constant,
    config
  };

  if (triggerType.includes("messages")) {
    return <MessagesContent {...updatedProps} />;
  }

  return <></>;
}
