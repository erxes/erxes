import React, { FC, useMemo } from "react";
import Select, { SingleValue } from "react-select";
import styled from "styled-components";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { __ } from "@erxes/ui/src/utils";
import { IIntegration } from "../../types";

const Wrapper = styled.div`
  flex: 1;

  > div {
    margin-bottom: 5px;

    .css-13cymwt-control,
    .css-t3ipsp-control {
      border: 0;
      height: 27px;
      min-height: unset;
    }
  }
`;

interface EmailOption {
  value: string;
  label: string;
}

interface MailChooserProps {
  onChange: (value: string | null) => void;
  selectedItem?: string;
  integrations: IIntegration[];
  verifiedImapEmails: string[];
  verifiedEngageEmails: string[];
  detailQuery: any;
}

const MailChooser: FC<MailChooserProps> = ({
  onChange,
  selectedItem = "",
  integrations,
  verifiedImapEmails = [],
  verifiedEngageEmails = [],
  detailQuery = {},
}) => {
  // Extract the default email from detailQuery
  const defaultEmail = useMemo(() => {
    const imapDetails = detailQuery.data?.imapConversationDetail;
    return imapDetails?.[0]?.mailData?.to?.[0]?.email || "";
  }, [detailQuery]);

  // Determine the currently selected email
  const selectedEmail = selectedItem || defaultEmail;

  // Prepare dropdown options
  const options = useMemo(() => {
    const createOptions = (emails: string[]): EmailOption[] =>
      emails.map(email => ({ value: email, label: email }));

    return [
      {
        label: "Shared Emails (IMAP)",
        options: createOptions(verifiedImapEmails),
      },
      {
        label: "Broadcast (Campaign)",
        options: createOptions(verifiedEngageEmails),
      },
    ];
  }, [verifiedImapEmails, verifiedEngageEmails]);

  // Handle changes to the selected value
  const handleSelectChange = (selected: SingleValue<EmailOption>) => {
    onChange(selected?.value || null);
  };

  // Compute the value to display in the Select component
  const selectedValue = useMemo(() => {
    for (const group of options) {
      const match = group.options.find(option => option.value === selectedEmail);
      if (match) return match;
    }
    return null;
  }, [selectedEmail, options]);

  return (
    <Wrapper>
      <FormGroup>
        <Select
          placeholder={__("Choose email to send from")}
          value={selectedValue}
          onChange={handleSelectChange}
          isClearable
          options={options}
        />
      </FormGroup>
    </Wrapper>
  );
};

export default MailChooser;
