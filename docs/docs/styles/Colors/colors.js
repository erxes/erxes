import React, { useState } from "react";
// import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { rgb, rgba, darken, lighten } from "erxes-ui/lib/styles/ecolor";
import color from "erxes-ui/lib/styles/colors";
import Alert from "erxes-ui/lib/utils/Alert/index";

export function ColorComponent(props) {
  const [copySuccess, setCopySuccess] = useState("");
  const { type, colors = [] } = props;

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess(`Copied! (${copyMe})`);
      Alert.success(`Copied! (${copyMe})`);
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const items = colors.map((clr, i) => {
    return (
      <div
        style={{
          background: color[clr],
          height: "80px",
          width: "240px",
          color:
            clr.includes("colorLightBlue") ||
            clr.includes("colorShadowGray") ||
            clr.includes("colorWhite") ||
            clr.includes("border") ||
            clr.includes("hadow") ||
            clr.includes("bg") ||
            clr.includes("link")
              ? clr.includes("bgDark")
                ? "white"
                : "black"
              : "white",
          borderRadius: "10px",
          fontWeight: 500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          onClick={() => {
            copyToClipBoard(clr);
          }}
          className={styles.buttonBox}
          key={i}
        >
          <span>{clr}</span>
          <span>{color[clr]}</span>
        </div>
      </div>
    );
  });

  if (type === "import") {
    return (
      <CodeBlock className="language-jsx">{`import colors from "erxes-ui/lib/styles/colors";`}</CodeBlock>
    );
  }

  if (type === "rgb") {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: rgb("#673FBD"),
            height: "40px",
            width: "150px",
            borderRadius: "15px",
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: rgb('#673FBD')`}</CodeBlock>
      </>
    );
  }
  if (type === "rgba") {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: rgba("#673FBD", 0.2),
            height: "40px",
            width: "150px",
            borderRadius: "15px",
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: rgba('#673FBD', 0.2)`}</CodeBlock>
      </>
    );
  }
  if (type === "darken") {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: darken("#673FBD", 30),
            height: "40px",
            width: "150px",
            borderRadius: "15px",
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: darken("#673FBD", 30)`}</CodeBlock>
      </>
    );
  }
  if (type === "lighten") {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: lighten("#673FBD", 30),
            height: "40px",
            width: "150px",
            borderRadius: "15px",
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: lighten("#673FBD", 30)`}</CodeBlock>
      </>
    );
  }

  return <div className={styles.test}>{items}</div>;
}
