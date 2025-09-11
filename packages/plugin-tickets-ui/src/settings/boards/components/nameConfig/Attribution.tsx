import React, { useState } from "react";
import { Attributes } from "@erxes/ui-tasks/src/settings/boards/styles";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import { __ } from "coreui/utils";

type AttributionItem = {
  label: string;
  value: string;
};

type Props = {
  config: string;
  setConfig: (config: string) => void;
  attributions: AttributionItem[];
};

export default function Attribution({
  config,
  setConfig,
  attributions,
}: Props) {
  const [search, setSearch] = useState("");

  const onClickAttribute = (item: AttributionItem, close: () => void) => {
    const characters = ["_", "-", "/", " "];
    const value = item.value;
    const changedConfig = characters.includes(value)
      ? `${config}${value}`
      : `${config}{${value}}`;
    setConfig(changedConfig);
    close();
  };

  const filtered = attributions.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const grouped: Record<string, AttributionItem[]> = filtered.reduce(
    (acc, item) => {
      const group = item.value.split(".")[0];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, AttributionItem[]>
  );

  // Popover content
  const content = (close: () => void) => (
    <Attributes
      style={{
        maxHeight: "300px",
        overflowY: "auto",
        padding: "0.5rem",
        minWidth: "200px",
      }}
    >
      <li>
        <b>{__("Attributions")}</b>
      </li>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          margin: "0.5rem 0",
          padding: "0.25rem 0.5rem",
          boxSizing: "border-box",
        }}
      />
      {Object.keys(grouped).map((group) => (
        <div key={group} style={{ marginBottom: "0.5rem" }}>
          <b style={{ textTransform: "capitalize" }}>{group}</b>
          {grouped[group].map((item) => (
            <button
              key={item.value}
              onClick={() => onClickAttribute(item, close)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                margin: "0.25rem 0",
                padding: "0.25rem 0.5rem",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {__(item.label)}
            </button>
          ))}
        </div>
      ))}
    </Attributes>
  );

  return (
    <Popover
      trigger={
        <span>
          {__("Attribution")} <Icon icon="angle-down" />
        </span>
      }
      placement="top"
      closeAfterSelect
    >
      {content}
    </Popover>
  );
}
