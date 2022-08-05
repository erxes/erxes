import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import ModalTrigger from "erxes-ui/lib/components/ModalTrigger";
import "erxes-icon/css/erxes.min.css";

export function ModalComponent(props) {
  const { type, table = [] } = props;


  const propDatas = () => {
    if (type) {
      const datas = {
        [type]:
          type === 'title'
            ? 'Title'
            : type === 'backDrop'
            ? 'static'
            : type === 'paddingContent'
            ? 'less-padding'
            : true,
        isAnimate: true,
      };
      return datas;
    }

    return null;
  };

  const renderBlock = () => {
    const content = () => <p>Show your content here</p>;
    return (
      <>
        <div className={styles.styled}>
          <ModalTrigger
            trigger={<Button>Click me to show modal</Button>}
            content={() => <p>Show your content here</p>}
            {...propDatas()}
          />
        </div>

        <CodeBlock className="language-jsx">
          {`<ModalTrigger\n\ttrigger={<Button>Click me to show modal</Button>}\n\tcontent={() => <p>Show your content here</p>}${type ? `\n\t` : ``}${stringify(
            propDatas()
          )}\n/>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APImodal") {
    return renderApiTable("ModalTrigger", table);
  }

  return renderBlock();
}
