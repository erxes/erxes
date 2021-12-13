import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import ConditionsRule from "erxes-ui/lib/components/rule/ConditionsRule";
import { stringify } from "../common.js";
import Table from "erxes-ui/lib/components/table/index";
import ModalTrigger from "erxes-ui/lib/components/ModalTrigger";
import "erxes-icon/css/erxes.min.css";

export function RuleComponent(props) {
  const { type } = props;

  const propDatas = () => {
    if (type === "desc") {
      const datas = {
        description: "Your custom description is here.",
      };
      return datas;
    }

    return null;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <ConditionsRule rules={[]} onChange={() => []} {...propDatas()} />
        </div>

        <CodeBlock className="language-jsx">
          {`<ConditionsRule rules={[]} onChange={() => []} ${stringify({
            ...propDatas(),
          })} />`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIrule") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import ConditionsRule from "erxes-ui/lib/components/rule/ConditionsRule";`}</CodeBlock>
        <p>
          required prop - <span className={styles.required}>*</span>
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
              <td rowSpan="5">
                rules<span className={styles.required}>*</span>
              </td>
              <td>
                _id<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define id</td>
            </tr>
            <tr>
              <td>kind</td>
              <td>string</td>
              <td />
              <td>Declare kind of the rule</td>
            </tr>
            <tr>
              <td>
                text<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define title of the rule</td>
            </tr>
            <tr>
              <td>
                condition<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define condition of the rule</td>
            </tr>
            <tr>
              <td>
                value<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define value of the rule</td>
            </tr>
            <tr>
              <td colSpan="2">
                onChange<span className={styles.required}>*</span>
              </td>
              <td>function</td>
              <td></td>
              <td>Callback fired after the delete button clicked</td>
            </tr>
            <tr>
              <td colSpan="2">description</td>
              <td>string</td>
              <td></td>
              <td>Define main description</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();

  //   return (
  //     <ConditionsRule
  //       rules={[
  //         //   {_id: Math.random().toString(), }
  //       ]}
  //       onChange={() => []}
  //     />
  //   );
}
