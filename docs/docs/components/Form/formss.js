import React, { useState } from "react";
import {
  ControlLabel,
  FormControl,
  FormGroup,
  Form,
} from "erxes-ui/lib/components/form/index";
import DateControl from "erxes-ui/lib/components/form/DateControl";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";

export function FormComponent(props) {
  const { type, elementType, addvalue, addtext, controltype } = props;

  if (type === "control") {
    const propDatas = (propName) => {
      const datas = {
        componentClass:
          elementType === "select"
            ? "select"
            : elementType === "checkbox"
            ? "checkbox"
            : elementType === "radio"
            ? "radio"
            : elementType === "poll"
            ? "poll"
            : "input",
        [propName]: addvalue,
        children: addtext && addtext,
      };
      return datas;
    };
    const renderBlock = (propName) => {
      return (
        <>
          <div className={styles.styleSpinner}>
            <FormControl {...propDatas(propName)} />
          </div>
          <CodeBlock className="language-jsx">
          {`<FormControl ${JSON.stringify(propDatas(propName))} />`}
          </CodeBlock>
        </>
      );
    };

    if (controltype === "checkbox") {
      return renderBlock("");
    }

    if (controltype === "checkedbox") {
      return renderBlock("checked");
    }

    if (controltype === "defcheckedbox") {
      return renderBlock("defaultChecked");
    }

    if (elementType === "select") {
      return renderBlock("options");
    }

    if (elementType === "poll") {
      return renderBlock("options");
    }

    if (controltype === "defvalue") {
      return renderBlock("defaultValue");
    }

    if (controltype === "value") {
      return renderBlock("value");
    }

    if (controltype === "placeholder") {
      return renderBlock("placeholder");
    }

    if (controltype === "round") {
      return renderBlock("round");
    }

    if (controltype === "autoComplete") {
      return renderBlock("autoComplete");
    }

    if (elementType === "radio") {
      return renderBlock("options");
    }
    return renderBlock("");
  }

  if (type === "label") {
    const propDatas = (propName) => {
      const kind = {
        [propName]: addvalue && addvalue,
      };
      return kind;
    };
    const renderBlock = (propName) => {
      return (
        <>
          <div className={styles.styled}>
            <ControlLabel {...propDatas(propName)}>{addtext}</ControlLabel>
            <FormControl />
          </div>
          <CodeBlock className="language-jsx">
            {`<>\n\t<ControlLabel ${JSON.stringify(
              propDatas(propName)
            )}>${addtext}</ControlLabel>\n\t<FormControl/>\n</>`}
          </CodeBlock>
        </>
      );
    };

    if (controltype === "required") {
      return renderBlock("required");
    }

    if (controltype === "uppercase") {
      return renderBlock("uppercase");
    }

    return renderBlock("");
  }

  // if(type === "group"){
  // const horizontal = addvalue && addvalue;
  // return (<>
  // <FormGroup horizontal={horizontal}>
  // <ControlLabel>Label</ControlLabel>
  // <FormControl />
  // </FormGroup>
  // <CodeBlock className="language-jsx">
  // {`<>\n\t<FormGroup horizontal=${horizontal}>\n\t  <ControlLabel>Label</ControlLabel>\n\t  <FormControl />\n\t</FormGroup>\n</>`}
  // </CodeBlock>
  // </>)
  // }

  if (type === "date") {
    var [datestate, setState] = useState();
    const onDateChange = (date) => {
      const currentDate = new Date();
      setState((datestate = date));
    };
    return (
      <>
        <DateControl
          required={false}
          name="birthDate"
          placeholder={"Birthday"}
          dateFormat="yyyy/MM/dd"
          value={datestate}
          onChange={onDateChange}
        />
      </>
    );
  }

  return null;
}
