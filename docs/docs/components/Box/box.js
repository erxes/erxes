import React from "react";
import Box from "erxes-ui/lib/components/Box";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function BoxComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName, extra, isComponent) => {
    let datas;
    if (propName) {
      const kind = {
        [propName]: propName !== "extraButtons" && true,
      };

      datas = {
        ...kind,
        title: "Title",
        name: "name",
        extraButtons: extra,
      };
    } else {
      datas = {
        title: "Title",
        name: "name",
      };
    }

    return datas;
  };

  const renderBlock = (propName, extraString, extra) => {
    return (
      <>
        <div className={styles.styled}>
          {propName === "collapsible" ? (
            <Box {...propDatas(propName, extra, true)}>
              <div className={styles.styled}>
                <p>
                  Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
                  American former professional basketball player, coach and
                  executive in the National Basketball Association (NBA).
                  Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird
                  is widely regarded as one of the greatest basketball players
                  of all time.Larry the Bird. Larry Joe Bird (born December 7,
                  1956) is an American former professional basketball player,
                  coach and executive in the National Basketball Association
                  (NBA). Nicknamed 'the Hick from French Lick' and 'Larry
                  Legend,' Bird is widely regarded as one of the greatest
                  basketball players of all time.Larry the Bird. Larry Joe Bird
                  (born December 7, 1956) is an American former professional
                  basketball player, coach and executive in the National
                  Basketball Association (NBA). Nicknamed 'the Hick from French
                  Lick' and 'Larry Legend,' Bird is widely regarded as one of
                  the greatest basketball players of all time.
                </p>
              </div>
            </Box>
          ) : (
            <Box {...propDatas(propName, extra, true)}>
              <div className={styles.styled}>
                <p>
                  Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
                  American former professional basketball player, coach and
                  executive in the National Basketball Association (NBA).
                </p>
              </div>
            </Box>
          )}
        </div>

        <CodeBlock className="language-jsx">
          {`<>\n\t${
            propName === "collapsible"
              ? `<Box ${stringify(propDatas(propName, extraString))} >\n\t\t<p>Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
              American former professional basketball player, coach and
              executive in the National Basketball Association (NBA).
              Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird
              is widely regarded as one of the greatest basketball players of
              all time.Larry the Bird. Larry Joe Bird (born December 7, 1956)
              is an American former professional basketball player, coach and
              executive in the National Basketball Association (NBA).
              Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird
              is widely regarded as one of the greatest basketball players of
              all time.Larry the Bird. Larry Joe Bird (born December 7, 1956)
              is an American former professional basketball player, coach and
              executive in the National Basketball Association (NBA).
              Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird
              is widely regarded as one of the greatest basketball players of
              all time.</p>\n\t</Box>`
              : `<Box ${stringify(propDatas(propName, extraString))} >\n\t\t<p>Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
              American former professional basketball player, coach and
              executive in the National Basketball Association (NBA).</p>\n\t</Box>`
          }\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "example") {
    return renderBlock();
  }

  if (type === "open") {
    return renderBlock("isOpen");
  }

  if (type === "collapsible") {
    return renderBlock("collapsible");
  }

  if (type === "extra") {
    return renderBlock("extraButtons", `<Button btnStyle='simple'>Extra button</Button>`, <Button btnStyle='simple'>Extra button</Button>);
  }

  if (type === "APIbox") {
    return renderApiTable("Box", table);
  }

  return null;
}
