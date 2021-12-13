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

export function FormComponent() {
  var [isSubmitted, setisSubmitted] = useState(false);
  var [mail, setMail] = useState("mm");
  var [pass, setPass] = useState("");

  console.log("mail before", mail);
  console.log("isSubmitted", isSubmitted);

  const submit = () => {
    setisSubmitted((isSubmitted = true));
  };
  const reset = () => {
    setisSubmitted((isSubmitted = false));
  };

  const onMailChange = (email) => {
    setMail((mail = email.value));
    console.log("mail", mail);
  };

  const passchange = (password) => {
    setPass((pass = password.value));
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
            onChange={onMailChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passchange}
            required={true}
          />
        </FormGroup>
        <Button onClick={submit}>Submit</Button>
        <Button onClick={reset}>Reset</Button>
      </>
    );
  };

  return (
    <>
      <Form renderContent={content}  />
      
    </>
  );
}
