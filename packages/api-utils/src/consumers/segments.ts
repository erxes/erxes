import { consumeRPCQueue } from "../messageBroker";

export const segmentsCunsomers = ({ name, segments }) => {
  if (segments.propertyConditionExtender) {
    segments.propertyConditionExtenderAvailable = true;
    consumeRPCQueue(
      `${name}:segments.propertyConditionExtender`,
      segments.propertyConditionExtender
    );
  }
  if (segments.associationFilter) {
    segments.associationFilterAvailable = true;
    consumeRPCQueue(
      `${name}:segments.associationFilter`,
      segments.associationFilter
    );
  }
  if (segments.esTypesMap) {
    segments.esTypesMapAvailable = true;
    consumeRPCQueue(`${name}:segments.esTypesMap`, segments.esTypesMap);
  }
  if (segments.initialSelector) {
    segments.initialSelectorAvailable = true;
    consumeRPCQueue(
      `${name}:segments.initialSelector`,
      segments.initialSelector
    );
  }
};
