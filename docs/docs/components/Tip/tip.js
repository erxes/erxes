import React from "react";
import Tip from "erxes-ui/lib/components/Tip";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TipComponent(props) {
  const { places = [], type, text, table = [] } = props;

  const propDatas = (plc) => {
    let kind;
    if (text) {
      kind = {
        text: text ? text : "Tip",
      };
    } else {
      kind = {
        placement: plc,
        text: text ? text : "Tip",
      };
    }

    return kind;
  };

  const renderBlock = (auto) => {
    return (
      <>
        <div className={styles.styled}>
          {auto ? (
            <>
              <Tip {...propDatas(auto)}>
                <Button className={styles.blueP}>Hover on me!</Button>
              </Tip>
              <br />
              <br />
            </>
          ) : (
            <>
              <Tip key={0} {...propDatas("top")}>
                <Button className={styles.blueP}>Hover on me!</Button>
              </Tip>
              <Tip key={1} {...propDatas("right")}>
                <Button className={styles.blueP}>Hover on me!</Button>
              </Tip>
              <Tip key={2} {...propDatas("bottom")}>
                <Button className={styles.blueP}>Hover on me!</Button>
              </Tip>
              <Tip key={3} {...propDatas("left")}>
                <Button className={styles.blueP}>Hover on me!</Button>
              </Tip>
              <br />
              <br />
            </>
          )}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${
            auto
              ? `\n\t<Tip ${stringify(
                  propDatas(auto)
                )}>\n\t\t<Button>Hover on me!</Button>\n\t</Tip>`
              : `\n\t<Tip ${stringify(
                  propDatas("top")
                )}>\n\t\t<Button>Hover on me!</Button>\n\t</Tip>
        <Tip ${stringify(
          propDatas("right")
        )}>\n\t\t<Button>Hover on me!</Button>\n\t</Tip>
        <Tip ${stringify(
          propDatas("bottom")
        )}>\n\t\t<Button>Hover on me!</Button>\n\t</Tip>
        <Tip ${stringify(
          propDatas("left")
        )}>\n\t\t<Button>Hover on me!</Button>\n\t</Tip>`
          }\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "auto") {
    return renderBlock("auto");
  }

  if (type === "APItip") {
    return renderApiTable("Tip", table);
  }

  return renderBlock();
}
