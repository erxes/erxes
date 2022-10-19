import React from "react";
import Chip from "erxes-ui/lib/components/Chip";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import Icon from "erxes-ui/lib/components/Icon";
import "erxes-icon/css/erxes.min.css";

export function ChipComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName, front, isComponent) => {
    const kind = {
      [propName]: propName === "frontContent" ? front : true,
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (propName, frontString, front) => {
    return (
      <>
        <div className={styles.styled}>
          <Chip {...propDatas(propName, front, true)}>chip</Chip>
        </div>

        <CodeBlock className="language-jsx">
          {`${
            propName
              ? `<Chip ${stringify(propDatas(propName, frontString))} >chip</Chip>`
              : `<Chip>chip</Chip>`
          } `}
        </CodeBlock>
      </>
    );
  };

  if (type === "example") {
    return renderBlock();
  }

  if (type === "capitalize") {
    return renderBlock("capitalize");
  }

  if (type === "frontContent") {
    return renderBlock(
      "frontContent",
      `<Icon icon='envelope-alt' />`,
      <Icon icon="envelope-alt" />
    );
  }

  if (type === "APIchip") {
    return renderApiTable("Chip", table);
  }

  return null;
}
