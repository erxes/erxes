import React from "react";
import HelpPopover from "erxes-ui/lib/components/HelpPopover";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function PopoverComponent(props) {
  const { triggerOf = [], type, table=[] } = props;
  const title = "Help title";
  const child = "Help information";

  const propDatas = (trgger) => {
    const kind = {
      trigger: trgger,
    };

    return kind;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styleSpinner}>
          {triggerOf.map((trgger) => {
            return (
              <div className={styles.spinner}>
                <HelpPopover title={title} {...propDatas(trgger)}>
                  {child}
                </HelpPopover>
              </div>
            );
          })}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${triggerOf.map((trgger) => {
            return `\n\t<HelpPopover title="${title}" ${stringify(propDatas(trgger))}>${child}</HelpPopover>`;
          }).join(' ')}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIpopover"){
    return renderApiTable("HelpPopover", table)
  }
  return renderBlock();
}
