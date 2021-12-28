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
    string = string.replace(/{}/g, "");
    string = string.slice(0, string.length - 1);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/true/g, '{true}');
    string = string.replace(/false/g, '{false}');
    
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

  const content = (formProps) => {
    var { values, isSubmitted } = formProps;
    return (
      <>
        <FormGroup horizontal={true}>
          <div className={styles.controllabel}>
          <ControlLabel required={true}>Email</ControlLabel></div>
          <FormControl
            {...formProps}
            required={true}
            type="email"
            name="email"
            placeholder="Email"
            value={mail}
            onChange={mailChange}
          /><div className={styles.controllabel}>
          <ControlLabel required={true}>Password</ControlLabel></div>
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
        <FormGroup horizontal={true}><div className={styles.controllabel}>
          <ControlLabel>Description</ControlLabel></div>
          <FormControl
            {...formProps}
            type="description"
            name="description"
            max={10}
            placeholder="Description"
            value={desc}
            onChange={descChange}
          /><div className={styles.controllabel}>
          <ControlLabel>Url input</ControlLabel></div>
          <FormControl
            {...formProps}
            type="url"
            name="url"
            placeholder="Insert url link"
            value={url}
            onChange={urlChange}
          />
        </FormGroup>
        <FormGroup horizontal={true}><div className={styles.controllabel}>
          <ControlLabel>Number</ControlLabel></div>
          <FormControl
            {...formProps}
            type="number"
            name="number"
            placeholder="Insert number"
            value={number}
            onChange={numberChange}
          /><div className={styles.controllabel}>
          <ControlLabel required={true}>Username</ControlLabel></div>
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

  if (type === "group") {
    const propDatas = () =>{
      const kind = {
        horizontal: addvalue && addvalue,
      }
      return kind;
    }
    const renderBlock = () => {
    return (
      <>
      <div className={styles.formborder}>
        <FormGroup {...propDatas()}>
          <ControlLabel>Label</ControlLabel>
          <FormControl />
        </FormGroup></div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<FormGroup ${stringify(propDatas())}>\n\t  <ControlLabel>Label</ControlLabel>\n\t  <FormControl />\n\t</FormGroup>\n</>`}
        </CodeBlock>
      </>
    );}
    return renderBlock()
  }

  if (type === "label") {
    const propDatas = (propName) =>{
      const kind = {
        [propName]: addvalue,
      }
      return kind;
    }
    const renderBlock = (propName) => {
    return (
      <>
      <div className={styles.formborder}>
          <ControlLabel {...propDatas(propName)}>{addtext}</ControlLabel>
          <FormControl />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<ControlLabel ${stringify(propDatas(propName))}>${addtext}</ControlLabel>\n\t<FormControl />\n</>`}
        </CodeBlock>
      </>
    );}
    if(elementType==="required"){
    return renderBlock("required");}
    if(elementType==="uppercase"){
      return renderBlock("uppercase");}
      return null;
  }

  if (type === "control") {
    if(controltype==="input"){
      return (
        <>
          <div className={styles.formborder}>
            <FormGroup>
              <ControlLabel>Default input</ControlLabel>
              <FormControl  /><br/>
              <ControlLabel>Example of disabled input</ControlLabel>
              <FormControl value="Disabled input" disabled={true} /><br/>
              <ControlLabel>Example of placeholder</ControlLabel>
              <FormControl placeholder="Place holder"/><br/>
              <ControlLabel>Example of value</ControlLabel>
              <FormControl value="You can't change value" /><br/>
              <ControlLabel>Example of default value</ControlLabel>
              <FormControl value="You can change default value" /><br/>
              <ControlLabel>Example of round edged input</ControlLabel>
              <FormControl placeholder="Round input" round={true} />
            </FormGroup>
          </div>
          <CodeBlock className="language-jsx">
            {`<>\n\t<FormGroup>
              <ControlLabel>Default input</ControlLabel>
              <FormControl  />
              <ControlLabel>Example of disabled input</ControlLabel>
              <FormControl value="Disabled input" disabled={true} />
              <ControlLabel>Example of placeholder</ControlLabel>
              <FormControl placeholder="Place holder"/>
              <ControlLabel>Example of value</ControlLabel>
              <FormControl value="You can't change value" />
              <ControlLabel>Example of default value</ControlLabel>
              <FormControl value="You can change default value" />
              <ControlLabel>Example of round edged input</ControlLabel>
              <FormControl placeholder="Round input" round={true} />
            </FormGroup>`}
          </CodeBlock>
        </>
      );};
      if(controltype==="select"){
        return (<>
        <div className={styles.formborder}>
        <FormControl componentClass="select" options={[{label:"Select options"}, {label: "Option 1"}, {label: "Option 2"}, {label: "Option 3"}]}/></div>
        <CodeBlock className="language-jsx">{`<FormControl componentClass="select" options={[{label:"Select options"}, {label: "Option 1"}, {label: "Option 2"}, {label: "Option 3"}]}/>`}</CodeBlock>
        </>)
      };

      if(controltype==="poll"){
        return (<>
        <div className={styles.formborder}>
        <FormControl componentClass="poll" options={["Poll 1", "Poll 2", "Poll 3"]}/></div>
        <CodeBlock className="language-jsx">{`<FormControl componentClass="poll" options={["Poll 1", "Poll 2", "Poll 3"]}/>`}</CodeBlock>
        </>)
      };
      if(controltype==="checkbox"){
        return (<>
        <div className={styles.formborder}>
          <div className={styles.test}>
        <FormControl componentClass="checkbox" />
        <FormControl componentClass="checkbox"  color="green"/>
        <FormControl componentClass="checkbox" disabled={true} />
        <FormControl componentClass="checkbox" children="Children prop" />
        <FormControl componentClass="checkbox" children="Checked" checked={true} />
        <FormControl componentClass="checkbox" children="Default checked" defaultChecked={true}/></div></div>
        <CodeBlock className="language-jsx">{`<>\n\t<FormControl componentClass="checkbox" />
        <FormControl componentClass="checkbox"  color="green"/>
        <FormControl componentClass="checkbox" disabled={true} />
        <FormControl componentClass="checkbox" children="Children prop" />
        <FormControl componentClass="checkbox" children="Checked" checked={true} />
        <FormControl componentClass="checkbox" children="Default checked" defaultChecked={true}/>\n</>`}</CodeBlock>
        </>)
      }
      if(controltype==="radio"){
        return (<>
         <div className={styles.formborder}>
          <div className={styles.test}>
        <FormControl componentClass="radio" />
        <FormControl componentClass="radio"  color="green"/>
        <FormControl componentClass="radio" disabled={true} />
        <FormControl componentClass="radio" children="Children prop" /></div></div>
        <CodeBlock className="language-jsx">{`<>\n\t<FormControl componentClass="radio" />
        <FormControl componentClass="radio"  color="green"/>
        <FormControl componentClass="radio" disabled={true} />
        <FormControl componentClass="radio" children="Children prop" />\n</>`}</CodeBlock>
        </>)
      }
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
        <Form renderContent={content} /></div>
        <CodeBlock className="language-jsx">
          {`    const content = (formProps) => {
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
    
    return <Form renderContent={content} />`}
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
