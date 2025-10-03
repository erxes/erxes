import { gql } from '@apollo/client';

export const USER_QUERY_FRAGMENT = gql`
  fragment UserQueryFragment on User {
    id
    firstName
    lastName
    email
    canImpersonate
    supportUserHash
    analyticsTinybirdJwt
    onboardingStatus
    workspaceMember {
      ...WorkspaceMemberQueryFragment
    }
    workspaceMembers {
      ...WorkspaceMemberQueryFragment
    }
    defaultWorkspace {
      id
      displayName
      logo
      domainName
      inviteHash
      allowImpersonation
      activationStatus
      isPublicInviteLinkEnabled
      hasValidEntrepriseKey
      featureFlags {
        id
        key
        value
        workspaceId
      }
      metadataVersion
      currentBillingSubscription {
        id
        status
        interval
      }
      workspaceMembersCount
    }
    workspaces {
      workspace {
        id
        logo
        displayName
        domainName
      }
    }
    userVars
  }
`;
