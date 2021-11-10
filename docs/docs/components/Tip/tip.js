import React from "react";
import Tip from "erxes-ui/lib/components/Tip";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TipComponent(props) {
  const { place = [], type, table = [] } = props;

  const propDatas = (placement, plc) => {
    const kind = {
      [placement]: plc,
      text: "Text",
    };

    return kind;
  };

  const renderBlock = (placement) => {
    return (
      <>
        <div className={styles.styled}>
          {place.map((plc, index) => {
            return (
              <Tip key={index} {...propDatas(text, placement, plc)}>
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
          {`<>${place.map((plc) => {
            return `\n\t<Tip ${stringify(
              propDatas(text, placement, plc)
            )} >\n\t\t<Button><p>${plc}</p><p>${plc}</p><p>${plc}</p></Button>\n\t</Tip>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "auto") {
    return renderBlock("placement");
  }

  if (type === "top") {
    return renderBlock("placement");
  }

  if (type === "right") {
    return renderBlock("placement");
  }

  if (type === "bottom") {
    return renderBlock("placement");
  }

  if (type === "left") {
    return renderBlock("placement");
  }

  if (type === "APItip") {
    return renderApiTable("Tip", table);
  }
}
