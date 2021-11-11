import React from "react";
import { Tabs, TabTitle } from "erxes-ui/lib/components/tabs/index";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

const handleSelect = (index) => {
  const string = "Children " + index;
  if (index === 0) {
    document.getElementById("Name").innerHTML =
      <Tabs><ul><li>John </li><li>Lisa</li></ul></Tabs>;
  }
  if (index === 1) {
    document.getElementById("Name").innerHTML =
      "<Tabs><ul><li>18 </li><li>24</li></ul></Tabs>";
  }
  if (index === 2) {
    document.getElementById("Name").innerHTML =
      "<Tabs><ul><li>NMCT</li><li>MIT</li></ul></Tabs>";
  }
};

export function TabsComponent() {
  let tabs = ["Name", "Age", "School"];

  return (
    <>
      {tabs.map((tab, index) => {
        return (
          <>
            <TabTitle
              key={index}
              children={tab}
              onClick={() => handleSelect(index)}
            />{" "}
          </>
        );
      })}
      <p id="Name"></p>
      <CodeBlock className="language-jsx">
          {`<>
          
          ${tabs.map((tab, index) => {
        return `\n\t
            <TabTitle
              children=${tab}
              onClick=${() => handleSelect(index)}
            />`
      })}\n</>`}
        </CodeBlock>
    </>
  );
}
