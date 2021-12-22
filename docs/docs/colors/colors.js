import React, { useState } from "react";
// import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import color from "erxes-ui/lib/styles/colors";

export function ColorComponent(props) {
  const [copySuccess, setCopySuccess] = useState("");
  const { type, colors = [] } = props;

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess("Copied!");
      alert("Copied!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const items = colors.map((clr, i) => {
    return (
      <div
        onClick={() => {
          copyToClipBoard(clr);
        }}
        key={i}
        style={{
          background: color[clr],
          height: "80px",
          width: "240px",
          padding: "10px",
          color: clr.includes("colorLightBlue") || clr.includes("colorShadowGray") || clr.includes("colorWhite") || clr.includes("border") || clr.includes("hadow") || clr.includes("bg") ? clr.includes("bgDark") ? "white" : "black" : "white",
          // colorShadowGray
        }}
      >
        <span>{clr}</span>
        <br />
        <span>{color[clr]}</span>
      </div>
    );
  });

  if (type === "import") {
    return (
      <CodeBlock className="language-jsx">{`import colors from "erxes-ui/lib/styles/colors";`}</CodeBlock>
    );
  }

  return (
    <>
      <div className={styles.test}>{items}</div>
      <br />
    </>
  );
}
