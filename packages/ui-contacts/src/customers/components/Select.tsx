import { gql, useQuery } from "@apollo/client";
import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const query = gql(`
    query Labels($forType: String!) {
        labels(forType: $forType) {
            name
            forType
            type
        }
    }
`);

type Props = {
  label: string;
  labels: any[];
};

const LabelSelect = (props: Props) => {
  const { label, labels } = props;

  const generateOptions = (array: any[]) => {
    const defaultOptions = array.filter((item) => item.type === "default");
    const customOptions = array.filter((item) => item.type !== "default");

    return [
      {
        label: "Default",
        options: defaultOptions.map((item) => ({
          value: item.name,
          label: item.name.replace(/^./, (char) => char.toUpperCase()),
        })),
      },
      {
        label: "Custom",
        options: customOptions.map((item) => ({
          value: item.name,
          label: item.name.replace(/^./, (char) => char.toUpperCase()),
        })),
      },
    ];
  };

  const options = generateOptions(labels);

  const selectedOption = options.find((option) =>
    option.options.find((option) => option.value === label)
  );

  return <Select value={selectedOption} options={options} />;
};

type MainProps = {
  data: any[];
  forType: string;
  labels: any[];
};

const MainSelect = (props: MainProps) => {
  const { data, forType } = props;

  const generateOptions = (array: any[]) => {
    return array.map((item) => ({
      value: item[forType],
      label: item[forType],
    }));
  };

  return <CreatableSelect options={generateOptions(data)} />;
};

type WrapperProps = {
  forType: string;
  data: any[];
};

const SelectWrapper = (props: WrapperProps) => {
  const { forType } = props;

  const { data } = useQuery(query, {
    variables: {
      forType,
    },
  });

  const extendedProps = {
    ...props,
    labels: data?.labels || [],
  };

  return <MainSelect {...extendedProps} />;
};

export default SelectWrapper;
