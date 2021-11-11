import React from "react";
import { Tabs, TabTitle } from "erxes-ui/lib/components/tabs/index";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TabsComponent(props) {
  const { type, table = [] } = props;
  let tabs = ["Tab 1", "Tab 2", "Tab 3"];

  const handleSelect = (propName, index) => {
    const string = "Context of tab " + (index + 1);
    if (propName === "full") {
      document.getElementById("full").innerHTML = string;
    }
    else if (propName === "grayBorder") {
      document.getElementById("border").innerHTML = string;
    }
    else 
    document.getElementById("id").innerHTML = string;
  };

  const propDatas = (propName) => {
    const kind = {
      [propName]: propName && true,
    };

    return kind;
  };

  const renderBlock = (propName) => {
    return (
      <>
        {tabs.map((tab, index) => {
          return (
            <>
              <TabTitle key={index} onClick={() => handleSelect(propName, index)}>
                {tab}
              </TabTitle>
            </>
          );
        })}
        {propName === "full" ? <Tabs id="full" {...propDatas(propName)}></Tabs> : propName === "grayBorder" ? <Tabs id="border" {...propDatas(propName)}></Tabs> : <Tabs id="id" {...propDatas(propName)}></Tabs>}
        
        <br />
        <CodeBlock className="language-jsx">
          {`<>${tabs.map((tab) => {
            return `\n\t<TabTitle onClick={() => handleSelect(index)}>
            ${tab}
          </TabTitle>`;
          })} \n\t<Tabs id="id" ${stringify(propDatas(propName))}></Tabs>\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "full") {
    return renderBlock("full");
  }

  if (type === "border") {
    return renderBlock("grayBorder");
  }

  if (type === "APItabs") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import { Tabs, TabTitle } from "erxes-ui/lib/components/tabs/index";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }

  if (type == "before") {
    return (
      <CodeBlock className="language-jsx">
        {`<>
    const handleSelect = (index) => {
      const string = "Children of tab " + (index + 1);
      if (index + 1) {
        document.getElementById("id").innerHTML = string;
      }
    };\n</>`}
      </CodeBlock>
    );
  }

  return renderBlock();
}
