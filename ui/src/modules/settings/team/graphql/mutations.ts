const commonParamsDef = `
  $username: String,
  $email: String,
  $details: UserDetails,
  $links: JSON,
  $channelIds: [String]
  $groupIds: [String]
  $brandIds: [String]
  $customFieldsData: JSON
`;

const commonParams = `
  username: $username,
  email: $email,
  details: $details,
  links: $links,
  channelIds: $channelIds
  groupIds: $groupIds
  brandIds: $brandIds
  customFieldsData: $customFieldsData
`;

const usersEdit = `
  mutation usersEdit($_id: String!, ${commonParamsDef}) {
    usersEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const usersEditProfile = `
  mutation usersEditProfile(
    $username: String!
    $email: String!
    $details: UserDetails
    $links: JSON 
    $password: String!
  ) {
    usersEditProfile(
      username: $username
      email: $email
      details: $details
      links: $links
      password: $password
    ) {
      _id
    }
  }
`;

const usersInvite = `
  mutation usersInvite($entries: [InvitationEntry]) {
    usersInvite(entries: $entries)
  }
`;

const usersResendInvitation = `
  mutation usersResendInvitation($email: String!) {
    usersResendInvitation(email: $email)
  }
`;

const usersSetActiveStatus = `
  mutation usersSetActiveStatus($_id: String!) {
    usersSetActiveStatus(_id: $_id) {
      _id
    }
  }
`;

const usersConfirmInvitation = `
  mutation usersConfirmInvitation($token: String, $password: String, $passwordConfirmation: String, $fullName: String, $username: String) {
    usersConfirmInvitation(token: $token, password: $password, passwordConfirmation: $passwordConfirmation, fullName: $fullName, username: $username) {
      _id
    }
  }
`;

const usersResetMemberPassword = `
  mutation usersResetMemberPassword($_id: String!, $newPassword: String!) {
    usersResetMemberPassword(_id: $_id, newPassword: $newPassword) {
      _id
    }
  }
`;

const userExcludeSkill = `
  mutation excludeUserSkill($_id: String!, $memberIds: [String]!) {
    excludeUserSkill(_id: $_id, memberIds: $memberIds)
  }
`;

const userAddSkill = `
  mutation addUserSkills($memberId: String!, $skillIds: [String]!) {
    addUserSkills(memberId: $memberId, skillIds: $skillIds)
  }
`;

const commonContactInfoParamsDef = `
  $phoneNumber: String
  $email: String
  $links: JSON
  $coordinate: CoordinateInput
  $image: AttachmentInput
`;

const commonContactInfoParams = `
  phoneNumber: $phoneNumber
  email: $email
  links: $links
  coordinate: $coordinate
  image: $image
`;

const commonStructureParamsDef = `
  $title: String!
  $description: String
  $code: String
  $supervisorId: String
  ${commonContactInfoParamsDef}
`;

const commonStructureParams = `
  title: $title
  description: $description
  code: $code
  supervisorId: $supervisorId
  ${commonContactInfoParams}
`;

const structuresAdd = `
  mutation structuresAdd(${commonStructureParamsDef}) {
    structuresAdd(${commonStructureParams}) {
      _id
    }
  }
`;

const structuresEdit = `
  mutation structuresEdit($_id: String!, ${commonStructureParamsDef}) {
    structuresEdit(_id: $_id, ${commonStructureParams}) {
      _id
    }
  }
`;

const commonDeparmentParamsDef = `
  $title: String,
  $description: String,
  $parentId: String
  $code: String
  $supervisorId: String
  $userIds: [String]
`;

const commonDeparmentParams = `
  title: $title,
  description: $description
  parentId: $parentId
  code: $code
  supervisorId: $supervisorId
  userIds: $userIds
`;

const departmentsAdd = `
  mutation departmentsAdd(${commonDeparmentParamsDef}) {
    departmentsAdd(${commonDeparmentParams}) {
      _id
    }
  }
`;

const departmentsEdit = `
  mutation departmentsEdit($_id: String!, ${commonDeparmentParamsDef}) {
    departmentsEdit(_id: $_id, ${commonDeparmentParams}) {
      _id
    }
  }
`;

const departmentsRemove = `
  mutation departmentsRemove($_id: String!) {
    departmentsRemove(_id: $_id)
  }
`;

const commonUnitParamsDef = `
  $title: String
  $description: String
  $supervisorId: String
  $code: String
  $departmentId: String
  $userIds: [String]
`;

const commonUnitParams = `
  title: $title,
  description: $description
  departmentId: $departmentId
  code: $code
  supervisorId: $supervisorId
  userIds: $userIds
`;

const unitsAdd = `
  mutation unitsAdd(${commonUnitParamsDef}) {
    unitsAdd(${commonUnitParams}) {
      _id
    }
  }
`;

const unitsEdit = `
  mutation unitsEdit($_id: String!, ${commonUnitParamsDef}) {
    unitsEdit(_id: $_id, ${commonUnitParams}) {
      _id
    }
  }
`;

const unitsRemove = `
  mutation unitsRemove($_id: String!) {
    unitsRemove(_id: $_id)
  }
`;

const commonBranchParamsDef = `
  $title: String
  $address: String
  $supervisorId: String
  $code: String
  $parentId: String
  $userIds: [String]
  ${commonContactInfoParamsDef}
`;

const commonBranchParams = `
  title: $title,
  address: $address
  parentId: $parentId
  code: $code
  supervisorId: $supervisorId
  userIds: $userIds
  ${commonContactInfoParams}
`;

const branchesAdd = `
  mutation branchesAdd(${commonBranchParamsDef}) {
    branchesAdd(${commonBranchParams}) {
      _id
    }
  }
`;

const branchesEdit = `
  mutation branchesEdit($_id: String!, ${commonBranchParamsDef}) {
    branchesEdit(_id: $_id, ${commonBranchParams}) {
      _id
    }
  }
`;

const branchesRemove = `
  mutation branchesRemove($_id: String!) {
    branchesRemove(_id: $_id)
  }
`;

export default {
  usersEditProfile,
  usersEdit,
  usersInvite,
  usersResendInvitation,
  usersConfirmInvitation,
  usersSetActiveStatus,
  usersResetMemberPassword,
  userAddSkill,
  userExcludeSkill,
  structuresAdd,
  structuresEdit,
  departmentsAdd,
  departmentsEdit,
  departmentsRemove,
  unitsAdd,
  unitsEdit,
  unitsRemove,
  branchesAdd,
  branchesEdit,
  branchesRemove
};
