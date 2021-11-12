import React from "react";
import Tip from "erxes-ui/lib/components/Tip";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TipComponent(props) {
  const { places = [], type, table = [] } = props;
  const text = "Text";

  const propDatas = (plc) => {
    const kind = {
      placement: plc,
      text: text,
    };

    return kind;
  };

  const renderBlock = (placement) => {
    return (
      <>
        <div className={styles.styled}>
          {places.map((plc, index) => {
            return (
              <Tip key={index} {...propDatas(plc)}>
                <Button>
                  {" "}
                  <p>{plc}</p>
                  <p>{plc}</p>
                  <p>{plc}</p>{" "}
                </Button>
              </Tip>
            );
          })}
        </div>
        <br />
        <CodeBlock className="language-jsx">
          {`<>${places.map((plc) => {
            return `\n\t<Tip ${stringify(
              propDatas(plc)
            )} >\n\t\t<Button><p>${plc}</p><p>${plc}</p><p>${plc}</p></Button>\n\t</Tip>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APItip") {
    return renderApiTable("Tip", table);
  }

  return renderBlock();
}
