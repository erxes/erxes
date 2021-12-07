import React from "react";
import AnimatedLoader from "erxes-ui/lib/components/AnimatedLoader";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";
import { colors } from "../../../../dashboard-ui/src/modules/common/styles/index";
import { renderApiTable } from "../common.js";

export function AnimatedLoaderComponent(props) {
  const { type, propName } = props;

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/":/g, ":");
    string = string.replace(/{"/g, "{{");
    string = string.slice(2, string.length);
    string = string.replace(/,"/g, ", ");
    string = string.replace(/loaderStyle:/g, "loaderStyle=");

    return string;
  };

  const propDatas = () => {
    const datas = {
      loaderStyle: {
        [propName]:
          propName === "color"
            ? colors.colorPrimary
            : propName === "width"
            ? "500px"
            : true,
        height: propName === "round" ? "100px" : "20px",
        width: propName === "round" ? "100px" : "100%",
      },
    };

    return datas;
  };

  const renderBlock = () => {
    return (
      <div className={styles.bigContainer}>
        <div className={styles.styled}>
          <AnimatedLoader {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<AnimatedLoader ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </div>
    );
  };

  if (type === "APIanimatedLoader") {
    return (
      <>
        {renderApiTable("AnimatedLoader")}
        <p>
          <required>* required prop</required>
        </p>
        <Table>
          <thead>
            <tr>
              <th colSpan="2">Name</th>
              <th>Type</th>
              <th>Defualt</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="8">loaderStyle</td>
              <td>height</td>
              <td>string</td>
              <td />
              <td>Set the custom height</td>
            </tr>
            <tr>
              <td>width</td>
              <td>string</td>
              <td />
              <td>Set the custom width</td>
            </tr>
            <tr>
              <td>color</td>
              <td>string</td>
              <td />
              <td>Set the custom color</td>
            </tr>
            <tr>
              <td>round</td>
              <td>boolean</td>
              <td />
              <td>Set border-radius: 50%</td>
            </tr>
            <tr>
              <td>margin</td>
              <td>string</td>
              <td />
              <td>Give margin (from top and left)</td>
            </tr>
            <tr>
              <td>marginRight</td>
              <td>string</td>
              <td />
              <td>Give margin (from right)</td>
            </tr>
            <tr>
              <td>isBox</td>
              <td>boolean</td>
              <td />
              <td>Show the loader as box</td>
            </tr>
            <tr>
              <td>withImage</td>
              <td>boolean</td>
              <td />
              <td>Show the loader with image</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}
