import React from "react";
import { BOARD_NAMES_CONFIGS } from "../../constants";
import Input from "./Input";
import { AttributeItem, BoardConfig } from "../../types";

type Props = {
  onChange: (key: string, config: string) => void;
  config: string;
  attributesItems?: AttributeItem[];
};

function BoardNumber({ config, onChange, attributesItems = [] }: Props) {
  const normalizedAttributes: BoardConfig[] = attributesItems.map((attr) => ({
    label: attr.name || attr.value,
    value: attr.value,
  }));

  const mergedBoardConfigs: BoardConfig[] = [
    ...normalizedAttributes,
    ...BOARD_NAMES_CONFIGS,
  ];

  return (
    <Input
      onChange={onChange}
      attributions={mergedBoardConfigs}
      config={config}
    />
  );
}

export default BoardNumber;
