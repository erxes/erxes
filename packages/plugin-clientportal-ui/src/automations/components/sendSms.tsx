import React, { useState } from "react";
import Common from "@erxes/ui-automations/src/components/forms/actions/Common";
import { IAction } from "@erxes/ui-automations/src/types";
import { setConfig } from "@erxes/ui";
import { useQuery, gql } from "@apollo/client";
import Select from "react-select";
import { __ } from "coreui/utils";
import Spinner from '@erxes/ui/src/components/Spinner';

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

const DOCUMENTS_GET_CONTENT_TYPES = gql`
  query DocumentsGetContentTypes {
    documentsGetContentTypes {
      contentType
      label
      subTypes
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

export default function MessagePro({ closeModal, activeAction, addAction }: Props) {
  const [config, setConfig] = useState(activeAction?.config || {});
  const [selectedContentType, setSelectedContentType] = useState(config.documentType || "");

  const { 
    loading: contentTypesLoading, 
    error: contentTypesError, 
    data: contentTypesData 
  } = useQuery(DOCUMENTS_GET_CONTENT_TYPES);

  const { 
    loading: documentsLoading, 
    error: documentsError, 
    data: documentsData 
  } = useQuery(DOCUMENTS_QUERY, {
    variables: {
      page: 1,
      perPage: 10,
      contentType: selectedContentType,
    },
    skip: !selectedContentType 
  });



    if (contentTypesLoading|| contentTypesError) {
    return <Spinner />;
  }

  const contentTypeOptions = contentTypesData?.documentsGetContentTypes?.map(type => ({
    value: type.contentType,
    label: type.label
  })) || [];

  const documentOptions = documentsData?.documents?.map(doc => ({
    value: doc._id,
    label: doc.name
  })) || [];

  const handleContentTypeChange = (selectedOption: any) => {
    const value = selectedOption?.value || "";
    setSelectedContentType(value);
    setConfig(prev => ({ ...prev, documentType: value, documentId: undefined }));
  };

  const handleSelectChange = (selectedOption: any) => {
    setConfig(prev => ({ ...prev, documentId: selectedOption?.value }));
  };

  return (
    <>
      <Common closeModal={closeModal} addAction={addAction} activeAction={activeAction} config={config}>
        <Select
          options={contentTypeOptions}
          onChange={handleContentTypeChange}
          value={contentTypeOptions.find(opt => opt.value === config.documentType)}
          placeholder="Choose a document type"
          isClearable
        />

        {config.documentType && (
          <Select
            options={documentOptions}
            onChange={handleSelectChange}
            value={documentOptions.find(opt => opt.value === config.documentId)}
            placeholder="Choose a document"
            isClearable
            isLoading={documentsLoading}
            isDisabled={documentsLoading || !!documentsError}
          />
        )}

        {documentsError && <div className="error-message">Error loading documents: {documentsError.message}</div>}
      </Common>
    </>
  );
}
