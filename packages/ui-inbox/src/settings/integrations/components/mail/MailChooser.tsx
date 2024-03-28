import * as React from "react";

import FormGroup from "@erxes/ui/src/components/form/Group";
import { IIntegration } from "../../types";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils";
import styled from "styled-components";

const Wrapper = styled.div`
  flex: 1;

  > div {
    margin-bottom: 5px;

    .Select-control {
      border: 0;
    }
  }
`;

type Props = {
  onChange: (value: string) => void;
  selectedItem?: string;
  integrations: IIntegration[];
  verifiedImapEmails: string[];
  verifiedEngageEmails: string[];
  messages: any;
};

class MailChooser extends React.Component<Props> {
  render() {
    const {
      messages = [],
      verifiedImapEmails = [],
      verifiedEngageEmails = [],
      selectedItem = "",
      onChange,
    } = this.props;

    const onSelectChange = (val) => {
      onChange(val && val.value);
    };

    const options = [
      {
        label: "Shared Emails (IMAP)",
        options: verifiedImapEmails.map((e) => ({ value: e, label: e })),
      },
      {
        label: "Broadcast (Campaign)",
        options: verifiedEngageEmails.map((e) => ({ value: e, label: e })),
      },
    ];

    let defaultEmail = "";
    if (messages.length > 0 && messages[0].mailData.to.length > 0) {
      defaultEmail = messages[0].mailData.to[0].email;
    }
    return (
      <Wrapper>
        <FormGroup>
          <Select
            placeholder={__("Choose email to send from")}
            value={options.map((o) =>
              o.options.find((item) => item.value === selectedItem)
            )}
            onChange={onSelectChange}
            options={options}
          />
        </FormGroup>
      </Wrapper>
    );
  }
}

export default MailChooser;
