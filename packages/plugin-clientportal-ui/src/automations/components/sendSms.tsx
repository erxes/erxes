import React, { useState } from "react";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import { IAction } from "@erxes/ui-automations/src/types";
import { setConfig } from "@erxes/ui";
import { useQuery, gql } from "@apollo/client";
import Select from "react-select";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { __ } from "coreui/utils";
const DOCUMENTS_QUERY = gql`
  query documents(
    $page: Int
    $perPage: Int
    $contentType: String
    $subType: String
  ) {
    documents(
      page: $page
      perPage: $perPage
      contentType: $contentType
      subType: $subType
    ) {
      _id
      name
    }
  }
`;

type Props = {
  actionsConst: any[];
  activeAction: IAction;
  addAction: () => void;
  closeModal: () => void;
  onSave: () => void;
  propertyTypesConst: any[];
};

export default function Workflow({
  closeModal,
  activeAction,
  addAction
}: Props) {
  const [config, setConfig] = useState(activeAction?.config || {});

  // Query to fetch documents
  const { loading, error, data } = useQuery(DOCUMENTS_QUERY, {
    variables: {
      page: 1,
      perPage: 10,
      contentType: "sales",
      subType: "deal"
    }
  });

  // Check if data is loading or error occurs
  if (loading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Map the documents to format suitable for react-select
  const documents = data?.documents || [];
  const options = documents.map((doc) => ({
    value: doc._id,
    label: doc.name
  }));

  const handleSelectChange = (selectedOption: any) => {
    // Handle the document selection and update config
    setConfig({ ...config, documentId: selectedOption?.value });
  };

return (
  <>
    <ControlLabel>{__("Document")}</ControlLabel>
    <Common
      closeModal={closeModal}
      addAction={addAction}
      activeAction={activeAction}
      config={config}>
      <Select
        options={options}
        onChange={handleSelectChange}
        value={options.find((opt) => opt.value === config.documentId)}
        placeholder='Choose a document'
        isClearable={true}
      />
    </Common>
  </>
);
}