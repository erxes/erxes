import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "../../../ui/src/modules/common/components/table";
import Button from "erxes-ui/lib/components/Button";

function Emptystate() {
  return (
    <>
      <EmptyState icon="info-circle" text="Text" />
      <CodeBlock className="language-jsx">{`<>
      <EmptyState icon="info-circle" text="Text" />
</>`}</CodeBlock>
    </>
  );
}

function Emptylight() {
  return (
    <>
      <EmptyState icon="info-circle" text="Text" light />
      <CodeBlock className="language-jsx">{`<>
        <EmptyState icon="info-circle" text="Text" light />
</>`}</CodeBlock>
    </>
  );
}

function Emptyimg() {
  return (
    <>
      <EmptyState
        image="https://erxes.io/static/images/logo/logo_dark.svg"
        text="Erxes"
      />
      <CodeBlock className="language-jsx">{`<>
    <EmptyState
    image="https://erxes.io/static/images/logo/logo_dark.svg"
    text="Erxes"
    />
</>`}</CodeBlock>
    </>
  );
}

function Emptyextra() {
  return (<>
    <EmptyState
      icon="info-circle"
      text="Text"
      extra={
        <Button size="small">
          Button
        </Button>
      }
    />
    <CodeBlock className="language-jsx">{`<>
    <EmptyState
    icon="info-circle"
    text="Text"
    extra={
      <Button size="small">
        Button
      </Button>
    }
  />
</>`}</CodeBlock>
  </>);
}

function Emptysize() {
  return (<>
  <EmptyState icon="info-circle" text="Text" size="30" />
  <CodeBlock className="language-jsx">{`<>
      <EmptyState icon="info-circle" text="Text" size="30" />
</>`}</CodeBlock>
  </>
  )
}

function Apiemptystate(){
return(<>
<CodeBlock className="language-jsx">{`import EmptyState from "erxes-ui/lib/components/EmptyState";`}</CodeBlock>
<Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>type</th>
            <th>description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>text</td>
            <td>string</td>
            <td>Show your text. If you want to show only text, use it with light prop.</td>
          </tr>
          <tr>
            <td>icon</td>
            <td>string</td>
            <td>Show icon.</td>
          </tr>
          <tr>
            <td>image</td>
            <td>string</td>
            <td>Show image.</td>
          </tr>
          <tr>
            <td>size</td>
            <td>string</td>
            <td>Size of icon.</td>
          </tr>
          <tr>
            <td>extra</td>
            <td>node</td>
            <td>Add other components or text.</td>
          </tr>
          <tr>
            <td>light</td>
            <td>boolean</td>
            <td>Show only first row.</td>
          </tr>
        </tbody>
      </Table>
  </>
)
}

export { Emptystate, Emptyimg, Emptyextra, Emptysize, Emptylight, Apiemptystate };
