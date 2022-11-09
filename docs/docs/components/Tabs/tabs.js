import React, { useState } from "react";
import { Tabs, TabTitle } from "erxes-ui/lib/components/tabs/index";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function TabsComponent(props) {
  const { type, table = [] } = props;
  let tabs = ["Tab 1", "Tab 2", "Tab 3"];
  const [content, setContent] = useState();

  const propDatas = (propName) => {
    const kind = {
      [propName]: true,
    };

    return kind;
  };

  const handleSelect = (index) => {
    setContent("Content of tab" + (index + 1));
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");
    string = string.replace(/id/g, "");

    return string;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <Tabs {...propDatas(propName)}>
          {tabs.map((tab, index) => {
            return (
              <>
                <TabTitle onClick={() => handleSelect(index)} key={index}>
                  {tab}
                </TabTitle>
              </>
            );
          })}
        </Tabs>
        <div>{content}</div>
        <br />
        <CodeBlock className="language-jsx">
          {`<>\n\t<Tabs ${stringify(propDatas(propName))}>
         ${tabs.map((tab, index) => {
           return ` <TabTitle onClick={() => handleSelect(${index})}>${tab}</TabTitle>\n\t`;
         }).join('')}</Tabs>\n\t<div>{content}</div>\n</>`}
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

  if (type === "before") {
    return (<>
    <CodeBlock className="language-javascript">{`import React, {useState} from "react";`}</CodeBlock>
      <CodeBlock className="language-javascript">{`const [content, setContent] = useState();
const handleSelect = (index) => {
      setContent("Content of tab" + (index + 1));
    };`}</CodeBlock>
    </>);
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
