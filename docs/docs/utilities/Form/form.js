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
import { renderApiTable } from "../../components/common.js";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";

export function FormComponent(props) {
  const { type, elementType, addvalue, addtext, controltype, table } = props;
  var [mail, setMail] = useState();
  var [pass, setPass] = useState();
  var [desc, setDesc] = useState();
  var [url, setUrl] = useState();
  var [number, setNumber] = useState();
  var [user, setUser] = useState();

  const numberChange = (num) => {
    setNumber((number = num.value));
  };

  const userChange = (user) => {
    setUser((user = user.value));
  };

  const urlChange = (url) => {
    setUrl((url = url.value));
  };

  const mailChange = (email) => {
    setMail((mail = email.value));
  };

  const passChange = (password) => {
    setPass((pass = password.value));
  };

  const descChange = (description) => {
    setDesc((desc = description.value));
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.slice(0, string.length - 1);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/label=/g, "{label:");
    string = string.replace(/options=/g, "options={");
    string = string.replace(/]/g, "]}");
    string = string.replace(/Option 2/g, ', "Option 2", ');
    
    return string;
  }

  const renderButton = (isSubmitted, sub) => {
    return (
      <Button
        onClick={() => {
          isSubmitted = true;
        }}
        type={sub}
      >
        Submit
      </Button>
    );
  };

  const content = () => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            required={true}
            type="email"
            name="email"
            placeholder="Email"
            value={mail}
            onChange={mailChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passChange}
            required={true}
          />
        </FormGroup>
      </>
    );
  };

  const val = (formProps) => {
    var { values, isSubmitted } = formProps;
    return (
      <>
        <FormGroup horizontal={true}>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            type="email"
            name="email"
            placeholder="Email"
            value={mail}
            onChange={mailChange}
          />
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passChange}
            required={true}
          />
        </FormGroup>
        <FormGroup horizontal={true}>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            type="description"
            name="description"
            max={10}
            placeholder="Description"
            value={desc}
            onChange={descChange}
          />
          <ControlLabel>Url input</ControlLabel>
          <FormControl
            {...formProps}
            type="url"
            name="url"
            placeholder="Insert url link"
            value={url}
            onChange={urlChange}
          />
        </FormGroup>
        <FormGroup horizontal={true}>
          <ControlLabel>Number</ControlLabel>
          <FormControl
            {...formProps}
            type="number"
            name="number"
            placeholder="Insert number"
            value={number}
            onChange={numberChange}
          />
          <ControlLabel required={true}>Username</ControlLabel>
          <FormControl
            {...formProps}
            type="username"
            name="username"
            required={true}
            placeholder="Insert username"
            value={user}
            onChange={userChange}
          />
        </FormGroup>
        {renderButton(isSubmitted, values, "submit")}
      </>
    );
  };

  if (type === "full") {
    return (
      <>
      <div className={styles.formborder}>
        <Form renderContent={content} /></div>
        <CodeBlock className="language-jsx">
          {`<>
        <FormGroup>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            type="email"
            name="email"
            placeholder="Email"
            value={mail}
            onChange={mailChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passChange}
            required={true}
          />
        </FormGroup>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "group") {
    const horizontal = addvalue && addvalue;
    return (
      <>
      <div className={styles.formborder}>
        <FormGroup horizontal={horizontal}>
          <ControlLabel>Label</ControlLabel>
          <FormControl />
        </FormGroup></div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<FormGroup horizontal=${horizontal}>\n\t  <ControlLabel>Label</ControlLabel>\n\t  <FormControl />\n\t</FormGroup>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "label") {
    return (
      <>
      <div className={styles.formborder}>
        <FormGroup horizontal={true}>
          <ControlLabel required={true}>required</ControlLabel>
          <FormControl />
        </FormGroup>
        <FormGroup horizontal={true}>
          <ControlLabel uppercase={false}>uppercase</ControlLabel>
          <FormControl />
        </FormGroup></div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<ControlLabel required={true}>required</ControlLabel>\n\t<ControlLabel uppercase={false}>uppercase</ControlLabel>\n</>`}
        </CodeBlock>
      </>
    );
  }

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
          <div className={styles.formborder}>
            <FormControl {...propDatas(propName)} />
          </div>
          <CodeBlock className="language-jsx">
            {`<FormControl ${stringify(propDatas(propName))} />`}
          </CodeBlock>
        </>
      );
    };

    if (controltype === "color") {
      return renderBlock("color");
    }

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

  if (type === "date") {
    const currentDate = new Date();
    var [datestate, setState] = useState(currentDate);
    const onDateChange = (date) => {
      setState((datestate = date));
    };

    var [dstate, setDstate] = useState(currentDate);
    const onDChange = (d) => {
      setDstate((dstate = d));
    };

    return (
      <>
          <div className={styles.datecontrol}>
        <FormGroup horizontal={true}>
          <div className={styles.test}>
          <DateControl
            placeholder="Input date"
            dateFormat="yyyy/MM/dd"
            value={datestate}
            onChange={onDateChange}
          />
          <DateControl
            placeholder="Input date"
            dateFormat="yyyy/MM/dd"
            value={dstate}
            onChange={onDChange}
            timeFormat={true}
          /></div>
        </FormGroup>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<FormGroup horizontal={true}>
            <DateControl
              placeholder="Input date"
              dateFormat="yyyy/MM/dd"
              value={datestate}
              onChange={onDateChange}
            />
            <DateControl
              placeholder="Input date"
              dateFormat="yyyy/MM/dd"
              value={dstate}
              onChange={onDChange}
              timeFormat={true}
            />
        </FormGroup>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "validations") {
    return (
      <>
      <div className={styles.formborder}>
        <Form renderContent={val} /></div>
        <CodeBlock className="language-jsx">
          {`const val = (formProps) => {
    var { values, isSubmitted } = formProps;
    return (
      <>
        <FormGroup horizontal={true}>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            type="email"
            name="email"
            placeholder="Email"
            value={mail}
            onChange={mailChange}
          />
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passChange}
            required={true}
          />
        </FormGroup>
        <FormGroup horizontal={true}>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            type="description"
            name="description"
            max={10}
            placeholder="Description"
            value={desc}
            onChange={descChange}
          />
          <ControlLabel>Url input</ControlLabel>
          <FormControl
            {...formProps}
            type="url"
            name="url"
            placeholder="Insert url link"
            value={url}
            onChange={urlChange}
          />
        </FormGroup>
        <FormGroup horizontal={true}>
          <ControlLabel>Number</ControlLabel>
          <FormControl
            {...formProps}
            type="number"
            name="number"
            placeholder="Insert number"
            value={number}
            onChange={numberChange}
          />
          <ControlLabel required={true}>Username</ControlLabel>
          <FormControl
            {...formProps}
            type="username"
            name="username"
            required={true}
            placeholder="Insert username"
            value={user}
            onChange={userChange}
          />
        </FormGroup>
        {renderButton(isSubmitted, values, "submit")}
      </>
    );`}
        </CodeBlock>
      </>
    );
  }

  if(type==="APIform"){
    return (<>
      <CodeBlock className="language-javascript">{`import Form from "erxes-ui/lib/components/form/index";`}</CodeBlock>
      {renderApiTable("",table)}
    </>)
  }

  if(type==="APIgroup"){
    return (<>
      <CodeBlock className="language-javascript">{`import FormGroup from "erxes-ui/lib/components/form/index";`}</CodeBlock>
      {renderApiTable("",table)}
    </>)
  }

  if(type==="APIlabel"){
    return (<>
      <CodeBlock className="language-javascript">{`import ControlLabel from "erxes-ui/lib/components/form/index";`}</CodeBlock>
      {renderApiTable("",table)}
    </>)
  }

  if(type==="APIcontrol"){
    return (<>
      <CodeBlock className="language-javascript">{`import FormControl from "erxes-ui/lib/components/form/index";`}</CodeBlock>
      {renderApiTable("",table)}
    </>)
  }

  if(type==="APIdate"){
    return (<>
      <CodeBlock className="language-javascript">{`import DateControl from "erxes-ui/lib/components/form/DateControl";`}</CodeBlock>
      {renderApiTable("",table)}
    </>)
  }

  return null;
}
