import React from "react";
import Chip from "erxes-ui/lib/components/Chip";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import Icon from "erxes-ui/lib/components/Icon";
import "erxes-icon/css/erxes.min.css";

export function ChipComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName) => {
    const kind = {
      [propName]:
        propName === "frontContent" ? <Icon icon="check-circle" /> : true,
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (propName) => {
    const id = "demo";
    return (
      <>
        <div className={styles.styled}>
          <Chip {...propDatas(propName)}>chip</Chip>
        </div>

        {/* <CodeBlock className="language-jsx">
          {`<Chip ${stringify(
              propDatas(propName)
            )} >chip</Chip>`}
        </CodeBlock> */}
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
    return renderBlock("frontContent");
  }

  if (type === "APIchip") {
    return renderApiTable("Chip", table);
  }

  return null;
}