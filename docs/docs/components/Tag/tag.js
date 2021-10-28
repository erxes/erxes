import React from "react";
import Tags from "erxes-ui/lib/components/Tags";
import CodeBlock from "@theme/CodeBlock";
import { stringify } from "../common.js";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

function TagComponent(props) {
  const { tag = [], lmt } = props;

  const propDatas = (tags, limit) => {
    const datas = {
      tags: tag,
      limit: lmt,
    };

    return datas;
  };

  const renderBlock = (tags, limit) => {
    return (
      <>
        <div className={styles.styled}>
          <Tags {...propDatas(tags, limit)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Tags ${JSON.stringify(propDatas(tags, limit))} />\n</>`}
        </CodeBlock>
      </>
    );
  };
  return renderBlock("tags", "limit");
}

function ApiTable() {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th colSpan="2">Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan="8">tag</td>
            <td>_id</td>
            <td>string</td>
            <td>id</td>
          </tr>
          <tr>
            <td>type</td>
            <td>string</td>
            <td>type</td>
          </tr>
          <tr>
            <td>name</td>
            <td>string</td>
            <td>name</td>
          </tr>
          <tr>
            <td>colorCode</td>
            <td>string</td>
            <td>colorCode</td>
          </tr>
          <tr>
            <td>objectCount</td>
            <td>number</td>
            <td>object count</td>
          </tr>
          <tr>
            <td>parentId</td>
            <td>string</td>
            <td>parent id</td>
          </tr>
          <tr>
            <td>order</td>
            <td>string</td>
            <td>order</td>
          </tr>
          <tr>
            <td>totalObjectCount</td>
            <td>number</td>
            <td>totalObjectCount</td>
          </tr>
          <tr>
            <td colSpan="2">size</td>
            <td>string</td>
            <td>size</td>
          </tr>
          <tr>
            <td colSpan="2">limit</td>
            <td>number</td>
            <td>limit number of tags to show</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}

export { TagComponent, ApiTable };
