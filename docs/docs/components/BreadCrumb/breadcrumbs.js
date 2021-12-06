import React from "react";
import BreadCrumb from "erxes-ui/lib/components/breadcrumb/BreadCrumb";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";
import Table from "erxes-ui/lib/components/table/index";

export function BreadCrumbComponent(props) {
  const { type } = props;

  if (type === "example") {
    return (
      <>
        <div className={styles.styled}>
          <BreadCrumb
            breadcrumbs={[
              { title: "title1", link: "../.." },
              { title: "title2", link: "../.." },
              { title: "title3" },
            ]}
          />
        </div>
        
        <CodeBlock className="language-jsx">
          {`<BreadCrumb breadcrumbs={[\n\t{title:"title1", link:"../.."},\n\t{title:"title2", link:"../.."},\n\t{title:"title3"}\n]}/>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIbreadcrumb") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import BreadCrumb from "erxes-ui/lib/components/breadcrumb/BreadCrumb";`}</CodeBlock>
        <p><required>* required prop</required></p>
        <Table>
          <thead>
            <tr>
              <th colSpan="2">Name</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="4">breadcrumbs</td>
              <td>title<required>*</required></td>
              <td>string</td>
              <td/>
              <td>Shows title of the breadcrumb item</td>
            </tr>
            <tr>
              <td>link</td>
              <td>string</td>
              <td/>
              <td>Define a hyperlink</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return null;
}
