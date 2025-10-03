import { gql } from '@apollo/client';

const GET_STRUCTURE_DETAILS = gql`
  query StructureDetail {
    structureDetail {
      _id
      code
      coordinate {
        latitude
        longitude
      }
      description
      email
      image {
        name
        size
        type
        url
      }
      links
      phoneNumber
      supervisor {
        _id
        email
        details {
          avatar
          fullName
          position
          operatorPhone
        }
      }
      supervisorId
      title
    }
  }
`;

export { GET_STRUCTURE_DETAILS };
