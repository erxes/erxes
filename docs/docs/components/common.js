import React from "react";
import Table from "../../../ui/src/modules/common/components/table";
import CodeBlock from "@theme/CodeBlock";

export default function ApiTable(table) {
  return (
    <>
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
  )
}