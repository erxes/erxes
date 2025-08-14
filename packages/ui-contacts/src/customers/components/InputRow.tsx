import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { FormWrapper as CommonFormWrapper } from "@erxes/ui/src/styles/main";
import { Alert, confirm } from "@erxes/ui/src/utils";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import styled from "styled-components";

const FormWrapper = styled(CommonFormWrapper)`
  align-items: end;
  gap: 10px;
  margin-bottom: 10px;
`;

const LABEL_QUERY = gql(`
  query ContactLabels($forType: String!) {
    contactLabels(forType: $forType) {
      name
      forType
      type
    }
  }
`);

const LABEL_MUTATION = gql(`
  mutation SaveContactLabel($name: String!, $forType: String!) {
    saveContactLabel(name: $name, forType: $forType) {
      name
      forType
      type
    }
  }
`);

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type Props = {
  label: string;
  labels: any[];
  selectedLabels: string[];
  onChange: (label: any) => void;
  saveLabel: (inputValue: string) => void;
};

const LabelSelect = (props: Props) => {
  const { label, labels, onChange, saveLabel, selectedLabels } = props;

  const filterFn = (item: any) => {
    if (
      item.name === "primary" &&
      item.name !== label &&
      selectedLabels.includes("primary")
    ) {
      return false;
    }
    return true;
  };

  const generateOptions = (array: any[]) => {
    const defaultOptions = array.filter(
      (item) => item.type === "default" && filterFn(item)
    );
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

  const selectedOption = options
    .flatMap((group) => group.options)
    .find((option) => option.value === label?.toLowerCase());

  const handleChange = (selectedOption: any) => {
    onChange(selectedOption);
  };

  const handleCreate = (inputValue: string) => {
    saveLabel(inputValue);
    onChange({ value: inputValue });
  };

  return (
    <div style={{ width: "100px" }}>
      <CreatableSelect
        value={selectedOption}
        options={options}
        onChange={handleChange}
        onCreateOption={handleCreate}
      />
    </div>
  );
};

type RowProps = {
  data: any[];
  query: string;
  queryName: string;
  forType: string;
  contactLabels: any[];
  onChange: (values: any[]) => void;
  saveContactLabel: (inputValue: string) => void;
};

const Input = (props: any) => {
  const { query, queryName, forType, onChange, onBlur } = props;

  const timerRef = React.useRef<number | null>(null);

  const [value, setValue] = useState(props.value || "");
  const [hasDuplicate, setHasDuplicate] = useState(false);

  const [loadQuery, { data: queryData }] = useLazyQuery(gql(query), {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (queryData && queryData[queryName]) {
      const fields = queryData[queryName] || [];

      const duplicates = fields.filter((item: any) => {
        const forTypeFields = item[`${forType}s`] || [];

        return forTypeFields.some((obj: any) => obj?.[forType] === value);
      });

      if (duplicates.length) {
        setHasDuplicate(true);
      }
    }
  }, [value, queryData]);

  const handleChange = (e: any) => {
    const inputValue = e.target.value;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setValue(inputValue);
    onChange(inputValue);

    timerRef.current = window.setTimeout(() => {
      loadQuery({
        variables: {
          searchValue: inputValue,
          autoCompletionType: `${forType}s.${forType}`,
          autoCompletion: true,
        },
      });
    }, 200);
  };

  const handleBlur = async () => {
    if (value && hasDuplicate) {
      const confirmation = await confirm(`Duplicate number is detected`, {
        okLabel: "Continue",
        cancelLabel: "Cancel",
      });

      if (!confirmation) {
        setHasDuplicate(false);
        return setValue("");
      }
    }

    onBlur();
  };

  return (
    <FormControl
      name={forType}
      placeholder={`Enter a ${forType}`}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

const Row = (props: RowProps) => {
  const { data, contactLabels, forType, onChange, saveContactLabel } = props;

  const [values, setValues] = useState<any[]>([]);

  useEffect(() => {
    if (!values?.length) {
      const hasPrimary = data.some((item) => item?.type === "primary");

      const dataWithIds = data.map((item) => ({
        ...item,
        _tempId: item?._tempId || generateId(),
      }));

      setValues([
        ...dataWithIds,
        {
          _tempId: generateId(),
          type: hasPrimary ? "other" : "primary",
          [forType]: "",
        },
      ]);
    }
  }, [data]);

  const validateValues = (values: any[]) => {
    if (!values.length) return [];

    return values
      .filter((value) => value?.type && value?.[forType])
      .map(({ _tempId, ...rest }) => rest);
  };

  const handleInputChange = (index: number, value: string) => {
    setValues((prevValues) => {
      const updatedValues = [...prevValues];

      updatedValues[index] = {
        ...updatedValues[index],
        [forType]: value,
      };

      onChange(validateValues(updatedValues));

      return updatedValues;
    });
  };

  const handleInputBlur = async () => {
    const isInputEmpty = values[values.length - 1][forType];

    if (isInputEmpty) {
      return setValues((prevValues) => {
        const updatedValues = [...prevValues];

        updatedValues.push({
          _tempId: generateId(),
          type: "other",
          [forType]: "",
        });

        return updatedValues;
      });
    }
  };

  const handleDelete = (index: number) => {
    setValues((prevValues) => {
      const updatedValues = [...prevValues];

      updatedValues.splice(index, 1);

      onChange(validateValues(updatedValues));

      return updatedValues;
    });
  };

  const handleLabelChange = (selectedOption: any, index: number) => {
    const value = selectedOption.value;

    setValues((prevValues) => {
      const updatedValues = [...prevValues];

      updatedValues[index] = {
        ...updatedValues[index],
        type: value,
      };

      onChange(validateValues(updatedValues));

      return updatedValues;
    });
  };

  return (
    <FormGroup>
      {values.map((value, index) => {
        return (
          <FormWrapper key={value._tempId}>
            <LabelSelect
              selectedLabels={values.map((v) => v.type)}
              label={value.type}
              labels={contactLabels}
              onChange={(selectedOption) =>
                handleLabelChange(selectedOption, index)
              }
              saveLabel={saveContactLabel}
            />

            <Input
              {...props}
              value={values[index][forType]}
              onChange={(value) => handleInputChange(index, value)}
              onBlur={() => handleInputBlur()}
            />

            {values.length > 1 && (
              <Button
                btnStyle="simple"
                icon="trash"
                size="small"
                onClick={() => handleDelete(index)}
              />
            )}
          </FormWrapper>
        );
      })}
    </FormGroup>
  );
};

type WrapperProps = {
  forType: string;
  data: any[];
  query: string;
  queryName: string;
  onChange: (values: any[]) => void;
};

const RowWrapper = (props: WrapperProps) => {
  const { forType } = props;

  const { data, refetch } = useQuery(LABEL_QUERY, {
    variables: {
      forType,
    },
  });

  const [contactLabelSave] = useMutation(LABEL_MUTATION, {
    refetchQueries: [
      {
        query: LABEL_QUERY,
        variables: {
          forType,
        },
      },
    ],
  });

  const saveContactLabel = (inputValue: string) => {
    contactLabelSave({
      variables: { name: inputValue, forType },
    })
      .then((res) => {
        const { _id } = res.data.saveContactLabel;

        if (_id) {
          refetch();
        }
      })
      .catch((err) => Alert.error(err.message));
  };

  const extendedProps = {
    ...props,
    saveContactLabel,
    contactLabels: data?.contactLabels || [],
  };

  return <Row {...extendedProps} />;
};

export default RowWrapper;
