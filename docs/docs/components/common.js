import React from "react";
import Table from "../../../ui/src/modules/common/components/table";
import CodeBlock from "@theme/CodeBlock";

export function renderApiTable(Name, table) {
  return (
    <>
      {Name && (
        <CodeBlock className="language-javascript">{`import ${Name} from "erxes-ui/lib/components/${Name}";`}</CodeBlock>
      )}

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, index) => (
            <tr key={index}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export function stringify(datas) {
  let string = JSON.stringify(datas);
  string = string.replace(/{"/g, "");
  string = string.replace(/":/g, "=");
  string = string.replace(/,"/g, " ");
  string = string.replace(/}/g, "");
  string = string.replace(/=true/g, "");
  
  return string;
}