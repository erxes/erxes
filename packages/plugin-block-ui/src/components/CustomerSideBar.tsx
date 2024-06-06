import React, { useState } from "react";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { List } from "../styles";
import Select from "react-select";
import { __ } from "coreui/utils";
import { BoxPadding } from "@erxes/ui-contacts/src/customers/styles";

type Props = {
  id: string;
  getBalance: number;
  verified: string;
  addBalance: (erxesCustomerId: string, amount: number) => void;
  updateVerify: (erxesCustomerId: string, isVerified: string) => void;
};

function CustomerSideBar({
  id,
  getBalance,
  verified,
  addBalance,
  updateVerify,
}: Props) {
  const [balance, setBalance] = useState(0);
  const [verify, setVerify] = useState(verified);
  console.log("block- sidebar");
  const onChangeBalance = (e) => {
    setBalance(Number(e.target.value));
  };

  const onVerifyChange = (option) => {
    const value = option ? option.value : "";

    setVerify(value);
  };

  const handleSubmitBalance = () => {
    addBalance(id, balance);
  };

  const handleSubmitVerify = () => {
    updateVerify(id, verify);
  };

  const options = [
    {
      label: "True",
      value: "true",
    },
    {
      label: "False",
      value: "false",
    },
    {
      label: "Loading",
      value: "loading",
    },
  ];

  return (
    <Box title={__("Block")} name="showOthers">
      <BoxPadding>
        <FormGroup>
          <ControlLabel>{__("Balance")}</ControlLabel>
          <FormControl
            type="number"
            defaultValue={balance}
            onChange={onChangeBalance}
          />
        </FormGroup>
        <Button btnStyle="success" onClick={handleSubmitBalance}>
          Submit
        </Button>
        <FormGroup>
          <ControlLabel>{__("Verify")}</ControlLabel>
          <Select
            value={options.find((o) => o.value === verify)}
            onChange={onVerifyChange}
            options={options}
            isClearable={false}
          />
        </FormGroup>
        <Button btnStyle="success" onClick={handleSubmitVerify}>
          Submit
        </Button>
        <List>
          <li>
            <div>{__("Total Balance")}: </div> <span>{getBalance}</span>
          </li>
        </List>
      </BoxPadding>
    </Box>
  );
}

export default CustomerSideBar;
