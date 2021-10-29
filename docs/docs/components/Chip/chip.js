import React from "react";
import Chip from "erxes-ui/lib/components/Chip";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import Icon from "erxes-ui/lib/components/Icon";
import "erxes-icon/css/erxes.min.css";

export function ChipComponent(props) {
  const { type, table = [] } = props;
  const handleClick = () => {
    alert("Clicked!!");
  };

  const propDatas = (propName, onClick) => {
    const kind = {
      [propName]:
        propName === "frontContent"
          ? <Icon icon="check-circle" />
          : true,
    };

    const datas = {
      ...kind,
      onClick: onClick && {handleClick},
    };

    return datas;
  };

  const renderBlock = (propName, onClick) => {
    return (
      <>
        <div className={styles.styled}>
          <Chip {...propDatas(propName, onClick)}>
            chip
          </Chip>
        </div>

        {/* <CodeBlock className="language-jsx">
          {`<Button ${stringify(
              propDatas(propName)
            )} >${btn}</Button>`}
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

  if (type === "onClick") {
    return renderBlock("capitalize", "onClick");
  }

  if (type === "APIchip") {
    return renderApiTable("Chip", table);
  }

  return null;
}
// export function ChipComponent(props) {
//   const handleClick = () => {
//     alert("Clicked!!");
//   };
//   return (
//       <Chip ={<Icon icon="check-circle" />}
//       >hhahah</Chip>
//   );
// };
