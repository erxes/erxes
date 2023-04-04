const clientPortalGetTicket = `
  query clientPortalTicket($_id: String!) {
    clientPortalTicket(_id: $_id) {
      _id
      name
      description
      modifiedAt
      status
      priority
      createdAt
      
      stage {
        name
      }

      labels {
        name
        colorCode

      }
    }
  }
`;

const clientPortalTickets = `
  query clientPortalTickets {
    clientPortalTickets {
      _id
      name
      description
      status
      priority
      createdAt

      stage {
        name
      }

      labels {
        name
        colorCode

      }
    }
  }
`;

const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser 
      createdAt
    }
  }
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String, $isVisibleToCreate: Boolean, $pipelineId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId, isVisibleToCreate: $isVisibleToCreate, pipelineId: $pipelineId) {
      _id
      type
      validation
      text
      field
      content
      description
      options
      objectListConfigs {
        key
        label
        type
      }
      isRequired
      order
      column
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      groupName
      associatedFieldId
      associatedField {
        _id
        text
        contentType
      }
      pageNumber
      productCategoryId
      isDefinedByErxes
      optionsValues,
    }
  }
`;

export default {
  clientPortalGetTicket,
  clientPortalTickets,
  clientPortalComments,
  fields
};
