import React from "react";
import { Tabs, TabTitle } from "erxes-ui/lib/components/tabs/index";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TabsComponent(props) {
  const { type, table = [] } = props;
  let tabs = ["Tab 1", "Tab 2", "Tab 3"];

  const propDatas = (propName) => {
    const kind = {
      [propName]: propName === "id" ? null : true,
    };

    return kind;
  };

  const handleSelect = (propName, index) => {
    const string = "Context of tab " + (index + 1);
    if (propName === "full") {
      document.getElementById("full").innerHTML = string;
    } else if (propName === "grayBorder") {
      document.getElementById("border").innerHTML = string;
    } else document.getElementById("id").innerHTML = string;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <Tabs {...propDatas(propName)}>
          {tabs.map((tab, index) => {
            return (
              <>
                <TabTitle
                  onClick={() => handleSelect(propName, index)}
                  key={index}
                >
                  {tab}
                </TabTitle>
              </>
            );
          })}
        </Tabs>
        <div id={propName} />
        <br />
        <CodeBlock className="language-jsx">
          {`<>\n\t<Tabs ${stringify(propDatas(propName))}>
         ${tabs.map((tab) => {
           return ` <TabTitle onClick={() => handleSelect(index)}>${tab}</TabTitle>\n\t`;
         })}</Tabs>\n</>`}
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

  if (type === "id") {
    return renderBlock("id");
  }

  if (type === "APItabs") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Tabs from "erxes-ui/lib/components/tabs/index";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }

  if (type === "APItabtitle") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import TabTitle from "erxes-ui/lib/components/tabs/index";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }
  return renderBlock();
}
