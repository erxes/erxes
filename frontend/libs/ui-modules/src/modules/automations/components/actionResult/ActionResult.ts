import {
  ActionResultBody,
  ActionResultField,
  ActionResultFields,
  ActionResultJson,
  ActionResultLayout,
  ActionResultStatus,
} from './ActionResultParts';

/**
 * The shared vocabulary every automation action result is built from — core
 * actions and plugin actions alike. An action declares what it has (status,
 * fields, a long body, raw json) and these render it the same way everywhere,
 * so no result has to invent its own layout or open its own dialog.
 */
export const ActionResult = Object.assign(ActionResultLayout, {
  Status: ActionResultStatus,
  Fields: ActionResultFields,
  Field: ActionResultField,
  Body: ActionResultBody,
  Json: ActionResultJson,
});
