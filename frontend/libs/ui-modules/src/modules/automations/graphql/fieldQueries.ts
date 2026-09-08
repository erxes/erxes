import gql from 'graphql-tag';

/**
 * The form-field catalog automations builds its attribute list from. Segments
 * moved to their own declaration, so this query lives with the feature that
 * still uses it.
 */
export const FIELDS_COMBINED_BY_CONTENT_TYPE = gql`
  query Fields($contentType: String!) {
    fieldsCombinedByContentType(contentType: $contentType)
  }
`;

/** Targets an automation can write a property onto, for a given source. */
export const AUTOMATION_SET_PROPERTY_TARGETS = gql`
  query AutomationSetPropertyTargets($sourceType: String!) {
    automationSetPropertyTargets(sourceType: $sourceType)
  }
`;

/** Both halves the property rule editor needs in one round trip. */
export const AUTOMATION_PROPERTIES_WITH_FIELDS = gql`
  query AutomationPropertiesWithFields(
    $contentType: String!
    $sourceType: String!
  ) {
    fieldsCombinedByContentType(
      contentType: $contentType
      usageType: "automations"
    )
    automationSetPropertyTargets(sourceType: $sourceType)
  }
`;
