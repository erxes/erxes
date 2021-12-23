import React, { useState } from "react";
// import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import dimension from "erxes-ui/lib/styles/dimensions";

export function DimensionComponent(props) {
  const [copySuccess, setCopySuccess] = useState("");
  const { type, dimensions = [] } = props;

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess(`Copied! (${copyMe})`);
      alert(`Copied! (${copyMe})`);
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const items = dimensions.map((dmnsn, i) => {
    return (
      <div
        onClick={() => {
          copyToClipBoard(dmnsn);
        }}
        key={i}
        style={{
          height: "240px",
          width: "350px",
          border: "2px solid #EEE",
          borderRadius: "10px",
          padding: dimension[dmnsn],
        }}
      >
        <div className={styles.smBox}>
          <span>{dmnsn}</span>
          <span>{dimension[dmnsn]}px</span>
        </div>
      </div>
    );
  });
  <div>
    <div></div>
  </div>

  if (type === "import") {
    return (
      <CodeBlock className="language-jsx">{`import dimensions from "erxes-ui/lib/styles/dimensions";`}</CodeBlock>
    );
  }

  return (
    <>
      <div className={styles.test}>{items}</div>
    </>
  );
  // return null;
}
