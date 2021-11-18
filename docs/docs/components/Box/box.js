import React from "react";
import Box from "erxes-ui/lib/components/Box";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function BoxComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName, extra) => {
    let datas;
    if(propName) {
      const kind = {
        [propName]: propName !== "extraButtons" && true,
      };
  
      datas = {
        ...kind,
        title: "Title",
        name: "name",
        extraButtons: extra && <Button>button</Button>,
      };
    } else {
      datas = {
        title: "Title",
        name: "name",
        extraButtons: extra && <Button>button</Button>,
      };
    }

    return datas;
  };

  const renderBlock = (propName, extra) => {
    return (
      <>
        <div className={styles.styled}>
          <Box {...propDatas(propName, extra )}>
            <div className={styles.styled}>
              <p>
                Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
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
                all time.
              </p>
            </div>
          </Box>
        </div>
        
        {/* <CodeBlock className="language-jsx">
          {`<>\n\t<Box ${stringify(
              propDatas(propName, extra)
            )} >Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
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
            all time.</Box>\n</>`}
        </CodeBlock> */}
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
    return renderBlock("collapsible", "extraButtons");
  }

  if (type === "APIbox") {
    return renderApiTable("Box", table);
  }

  return null;
}
