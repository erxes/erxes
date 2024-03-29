import React, { useState } from "react";
import {
  BarItems,
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __,
} from "@erxes/ui/src";
import { IResponse } from "../containers/ResponseForm";

type Props = {
  closeModal: () => void;
  response: (props: IResponse) => void;
};

const ResponseComponent: React.FC<Props> = (props) => {
  const [state, setState] = useState({
    description: "",
    response: "",
  });

  const renderContent = () => {
    const { response, description } = state;

    const handleResponse = (response: "approved" | "declined") => {
      props.response({ description, response });
    };

    const handleChange = (e) => {
      const { value } = e.currentTarget as HTMLInputElement;
      setState((prevState) => ({ ...prevState, description: value }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__("Description")}</ControlLabel>
          <FormControl componentclass="textarea" onChange={handleChange} />
        </FormGroup>
        <BarItems>
          <Button btnStyle="danger" onClick={() => handleResponse("declined")}>
            {response === "declined" && <Icon icon="check-1" />}
            {__("Decline")}
          </Button>
          <Button btnStyle="success" onClick={() => handleResponse("approved")}>
            {response === "approved" && <Icon icon="check-1" />}
            {__("Approve")}
          </Button>
        </BarItems>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default ResponseComponent;
