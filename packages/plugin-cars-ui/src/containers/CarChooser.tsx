import ConformityChooser from "@erxes/ui-sales/src/conformity/containers/ConformityChooser";
import { gql, useQuery, useMutation } from "@apollo/client";
import React, { useState } from "react";

import { mutations, queries } from "../graphql";
import {
  AddMutationResponse,
  CarsQueryResponse,
  ICar,
  ICarDoc
} from "../types";
import CarForm from "./CarForm";

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
} & WrapperProps;

const CarChooser = (props: Props) => {
  const { data, searchValue, perPage, search } = props;

  const [car, setCar] = useState<ICar | undefined>(undefined);

  const carsQuery = useQuery<CarsQueryResponse>(gql(queries.cars), {
    variables: {
      searchValue,
      perPage,
      mainType: data.mainType,
      mainTypeId: data.mainTypeId,
      isRelated: data.isRelated,
      sortField: "createdAt",
      sortDirection: -1
    },
    fetchPolicy: data.isRelated ? "network-only" : "cache-first"
  });

  const [carsAdd] = useMutation<AddMutationResponse, ICarDoc>(
    gql(mutations.carsAdd)
  );

  const renderName = car => {
    return car.plateNumber || car.vinNumber || "Unknown";
  };

  const getAssociatedCar = (newCar: ICar) => {
    setCar(newCar);
  };

  const resetAssociatedItem = () => {
    return setCar(undefined);
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.cars,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      relType: "car"
    },
    search,
    clearState: () => search(""),
    title: "Car",
    renderForm: formProps => (
      <CarForm {...formProps} getAssociatedCar={getAssociatedCar} />
    ),
    renderName,
    newItem: car,
    resetAssociatedItem,
    datas: carsQuery?.data?.cars || [],
    refetchQuery: queries.cars
  };

  return <ConformityChooser {...updatedProps} />;
};

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    cars: ICar[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: ICar[]) => void;
  closeModal: () => void;
};

const Wrapper = (props: WrapperProps) => {
  const [perPage, setPerPage] = useState<number>(20);
  const [searchValue, setSearchValue] = useState<string>("");

  const search = (value, loadmore) => {
    let page = 20;

    if (loadmore) {
      page = page + 20;
    }

    setPerPage(perPage);
    setSearchValue(value);
  };

  return (
    <CarChooser
      {...props}
      search={search}
      searchValue={searchValue}
      perPage={perPage}
    />
  );
};

export default Wrapper;
