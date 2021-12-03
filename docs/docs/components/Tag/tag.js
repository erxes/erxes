import React from "react";
import Tags from "erxes-ui/lib/components/Tags";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

function TagComponent(props) {
  const { type, colors = [] } = props;

  const propDatas = (limit) => {
    const arr = [];
    colors.map((clr, i) => {
      arr.push({ _id: i, type: "", name: clr, colorCode: clr })

    });
    console.log(arr);
    const kind = {
      tags: arr,
    };

    const datas = {
      ...kind,
      limit: limit && 3,
    };

    return datas;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/{"tags":/g, "tags={");
    string = string.replace(/{"/g, "\n\t\t{");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ", ");
    string = string.replace(/]/g, "\n\t]");
    string = string.replace(/3}/g, "{3}");
    string = string.replace(/], limit:/g, "]} limit=");

    return string;
  }

  const renderBlock = (limit) => {
    return (
      <>
        <div className={styles.styled}>
          <Tags {...propDatas(limit)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Tags ${stringify(propDatas(limit))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "color") {
    return renderBlock();
  }

  if (type === "limit") {
    return renderBlock("limit");
  }
  
  if(type === "APItags") {
    return (
      <>
      <CodeBlock className="language-javascript">{`import Tags from "erxes-ui/lib/components/Tags";`}</CodeBlock>
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
            <td rowSpan="4">tags<required>*</required></td>
            <td>_id<required>*</required></td>
            <td>string</td>
            <td/>
            <td>Define tag id</td>
          </tr>
          <tr>
            <td>type<required>*</required></td>
            <td>string</td>
            <td/>
            <td>Define tag type</td>
          </tr>
          <tr>
            <td>name<required>*</required></td>
            <td>string</td>
            <td/>
            <td>Define tag name</td>
          </tr>
          <tr>
            <td>colorCode<required>*</required></td>
            <td>string</td>
            <td/>
            <td>Set the tag color</td>
          </tr>
          <tr>
            <td colSpan="2">limit</td>
            <td>number</td>
            <td/>
            <td>Limits number of tags to show</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
return null;
}
export { TagComponent };
