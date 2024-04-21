import * as React from "react";

import FormGroup from "@erxes/ui/src/components/form/Group";
import { IIntegration } from "../../types";
import Select from "react-select";
import { __ } from "@erxes/ui/src/utils";
import { dealFields } from "@erxes/ui-cards/src/deals/graphql/queries";
import styled from "styled-components";

const Wrapper = styled.div`
  flex: 1;

  > div {
    margin-bottom: 5px;

    .css-13cymwt-control {
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
  detailQuery: any;
};

class MailChooser extends React.Component<Props> {
  render() {
    const {
      detailQuery = [],
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

    if (
      detailQuery.imapConversationDetail?.length > 0 &&
      detailQuery.imapConversationDetail[0].mailData.to?.length > 0
    ) {
      defaultEmail = detailQuery.imapConversationDetail[0].mailData.to[0].email;
    }
    let email = "";
    if (selectedItem) {
      email = selectedItem;
    } else {
      email = defaultEmail;
    }
    return (
      <Wrapper>
        <FormGroup>
          <Select
            placeholder={__("Choose email to send from")}
            value={options.map((item) =>
              item.options.find((option) => option.value === email)
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
