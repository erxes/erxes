import { gql } from '@apollo/client';

const chartSupervisorFields = `
  supervisor {
    _id
    details {
      fullName
      avatar
    }
  }
`;

export const GET_STRUCTURE_CHART_DEPARTMENTS = gql`
  query StructureChartDepartments {
    departments(withoutUserFilter: true) {
      _id
      title
      code
      parentId
      order
      status
      userCount
      userIds
      supervisorId
      ${chartSupervisorFields}
    }
  }
`;

export const GET_STRUCTURE_CHART_BRANCHES = gql`
  query StructureChartBranches {
    branches(withoutUserFilter: true) {
      _id
      title
      code
      parentId
      order
      status
      userCount
      userIds
      supervisorId
      ${chartSupervisorFields}
    }
  }
`;

export const GET_STRUCTURE_CHART_POSITIONS = gql`
  query StructureChartPositions {
    positions(withoutUserFilter: true) {
      _id
      title
      code
      parentId
      order
      status
      userCount
      userIds
    }
  }
`;

export const GET_STRUCTURE_CHART_UNITS = gql`
  query StructureChartUnits {
    units {
      _id
      title
      code
      departmentId
      userCount
      userIds
      supervisorId
      ${chartSupervisorFields}
    }
  }
`;
