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
          width: "185px",
          padding: "5px",
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

// import React, { useState } from "react";
// import Button from "erxes-ui/lib/components/Button";
// import styles from "../../src/components/styles.module.css";
// import CodeBlock from "@theme/CodeBlock";
// import "erxes-icon/css/erxes.min.css";
// import Icon from "erxes-ui/lib/components/Icon";
// import Filter from "erxes-ui/lib/components/filterableList/Filter";

// export function IconsComponent(props) {
//   const { icons, type } = props;

//   var [search, setSearch] = useState(null);
//   const [copySuccess, setCopySuccess] = useState("");

//   const copyToClipBoard = async (copyMe) => {
//     try {
//       await navigator.clipboard.writeText(copyMe);
//       setCopySuccess("Copied!");
//       alert("Copied!");
//     } catch (err) {
//       setCopySuccess("Failed to copy!");
//     }
//   };

//   const searchHandler = (e) => {
//     let keyword = e.target.value;
//     setSearch((search = keyword));
//     console.log("search", search);
//   };

//   const items = icons
//     .filter((data) => {
//       if (search == null) return data;
//       else if (data.toLowerCase().includes(search.toLowerCase())) {
//         return data;
//       }
//     })
//     .map((data) => {
//       return (
//         <Button
//           btnStyle="simple"
//           onClick={() => {
//             copyToClipBoard(data);
//           }}
//           className={styles.iconButton}
//         >
//           <div className={styles.iconWidth}>
//             <Icon icon={data} size={25} />
//             <br />
//             {data}
//           </div>
//         </Button>
//       );
//     });

//   return (
//     <>
//       <CodeBlock className="language-javascript">{`import "erxes-icon/css/erxes.min.css";`}</CodeBlock>
//       <Filter onChange={(e) => searchHandler(e)} />
//       {items}
//     </>
//   );
// }
