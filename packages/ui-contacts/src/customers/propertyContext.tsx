import React, { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

import { IField } from "@erxes/ui/src/types";
import { IFieldsVisibility } from "./types";
import { InboxFieldsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";

interface IStore {
  deviceFields: IField[];
  conversationFields: IField[];
  customerFields: IField[];
  customerVisibility: (key: string) => IFieldsVisibility;
  deviceVisibility: (key: string) => IFieldsVisibility;
}

type Props = {
  children: any;
};

const PropertyContext = React.createContext({} as IStore);

export const PropertyConsumer = PropertyContext.Consumer;

const isVisible = (fields: IField[]) => {
  return (key: string) => {
    const data = {} as IFieldsVisibility;

    for (const field of fields || []) {
      if (field[key]) {
        data[field.type] = field.text || "";
      }
    }
    return data;
  };
};

const usePropertyData = () => {
  const { loading, data } = useQuery<{ inboxFields: InboxFieldsQueryResponse }>(
    gql(fieldQueries.inboxFields),
    {
      skip: !isEnabled("inbox"),
    }
  );

  const inboxFields = data?.inboxFields || {
    device: [],
    conversation: [],
    customer: [],
  };
  const { device = [], conversation = [], customer = [] } = inboxFields as any;

  const customerVisibility = useMemo(() => isVisible(customer), [customer]);
  const deviceVisibility = useMemo(() => isVisible(device), [device]);

  const value: IStore = useMemo(
    () => ({
      deviceFields: device,
      conversationFields: conversation,
      customerFields: customer,
      customerVisibility,
      deviceVisibility,
    }),
    [device, conversation, customer, customerVisibility, deviceVisibility]
  );

  return { loading, value };
};

const PropertyProvider: React.FC<Props> = ({ children }) => {
  const { loading, value } = usePropertyData();

  if (loading) {
    return <Spinner />;
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export default PropertyProvider;
