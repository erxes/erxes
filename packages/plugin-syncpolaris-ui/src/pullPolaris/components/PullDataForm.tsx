import {
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  Table,
  __,
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";
type Props = {
  customerId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  customerScore?: any;
  registerNumber?: string;
};

export default function PullDataForm(props: Props) {
  const [keyword, setKeyword] = useState(props.registerNumber);

  const generateDoc = (values) => {
    return { keyword };
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, customerScore } = props;
    const { values, isSubmitted } = formProps;
    return (
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true}>{__("Register number")}</ControlLabel>
            <FormControl
              disabled={true}
              {...formProps}
              type={"text"}
              name="keyword"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            {renderButton({
              name: "Buren Scoring",
              values: generateDoc(values),
              isSubmitted,
              object: customerScore,
            })}
          </FormGroup>
          <FormGroup>
            <Table>
              <thead>
                <tr>
                  <th>{__("Score")}</th>
                  <th>{__("Type")}</th>
                  <th>{__("get Date")}</th>
                </tr>
              </thead>
              <tbody id="detail">
                <tr key={customerScore?._id}>
                  <td>{customerScore?.score}</td>
                  <td>{customerScore?.reportPurpose}</td>
                </tr>
              </tbody>
            </Table>
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    );
  };

  return <Form renderContent={renderContent} />;
}
