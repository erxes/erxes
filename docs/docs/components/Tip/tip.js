import React from "react";
import Tip from "erxes-ui/lib/components/Tip";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TipComponent(props) {
  const { places = [], type, table = [] } = props;

  const propDatas = (plc) => {
    const kind = {
      placement: plc,
      text: "Tip",
    };

    return kind;
  };

  const renderBlock = (placement) => {
    return (
      <>
        <div className={styles.bluePContainer}>
          {places.map((plc, index) => {
            return (
              <>
                <Tip key={index} {...propDatas(plc)}>
                  <p className={styles.blueP}>
                    Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
                    American former professional basketball player, coach and
                    executive in the National Basketball Association (NBA).
                    Nicknamed 'the Hick from French Lick' and 'Larry Legend,'
                    Bird is widely regarded as one of the greatest basketball
                    players of all time.
                  </p>
                </Tip>
                <br />
              </>
            );
          })}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${places.map((plc) => {
            return `\n\t<Tip ${stringify(
              propDatas(plc)
            )} >\n\t\t<p>Larry the Bird. Larry Joe Bird (born December 7, 1956) is an American former professional basketball player, coach and executive in the National Basketball Association (NBA). Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird is widely regarded as one of the greatest basketball players of all time.</p>\n\t</Tip>`;
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
