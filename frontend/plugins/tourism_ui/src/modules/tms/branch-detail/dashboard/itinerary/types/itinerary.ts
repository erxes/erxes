export interface IItinerary {
  _id: string;
  branchId?: string;
  name?: string;
  duration?: number;
  createdAt?: string;
  modifiedAt?: string;
  color?: string;
  images?: string[];
  content?: string;
  totalCost?: number;
  guideCost?: number;
  driverCost?: number;
  foodCost?: number;
  gasCost?: number;
  personCost?: Record<string, number>;
  guideCostExtra?: number;
  groupDays?: Array<{
    __typename?: string;
    day?: number;
    title?: string;
    content?: string;
    elements?: Array<{
      __typename?: string;
      elementId?: string;
      orderOfDay?: number;
    }>;
    elementsQuick?: Array<{
      __typename?: string;
      elementId?: string;
      orderOfDay?: number;
    }>;
    images?: string[];
  }>;
}
