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
  // var [submitted, setsubmitted] = useState(false);
  var [mail, setMail] = useState();
  var [pass, setPass] = useState();

  const onMailChange = (email) => {
    setMail((mail = email.value));
  };

  const passchange = (password) => {
    setPass((pass = password.value));
  };

  const renderButton = (isSubmitted) => {
    return (
      <Button
        onClick={() => {
          isSubmitted = true;
          console.log(isSubmitted);
        }}
      >
        Submit
      </Button>
    );
  };

  const content = (formProps) => {
    console.log("hi");
    var { isSubmitted } = formProps;
    console.log("isSubmitted", isSubmitted);
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            {...formProps}
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
            {...formProps}
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={passchange}
            required={true}
          />
        </FormGroup>
        {/* <Button
          onClick={() => {
            isSubmitted = true;
            console.log("set", isSubmitted);
          }}
        >
          Submit
        </Button>
        <Button
          onClick={() => {
            isSubmitted = false;
            // console.log("res", submitted);
          }}
        >
          Reset
        </Button> */}
        {renderButton({
          isSubmitted,
        })}
      </>
    );
  };

  return (
    <>
      <Form renderContent={content} />
    </>
  );
}
