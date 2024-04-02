import { __ } from "@erxes/ui/src/utils/core";
import React, { useEffect, useState } from "react";
import Select from "react-select";

type Props = {
  loading?: boolean;
  filtered: any[];
  value: string[];
  onSearch: (value: string) => void;
  onChange: (value: string[]) => void;
};

const SelectServices: React.FC<Props> = (props) => {
  const { filtered = [], value } = props;

  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    let timeoutId: any = null;

    if (searchValue) {
      timeoutId = setTimeout(() => {
        props.onSearch(searchValue);
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [searchValue]);

  const onInputChange = (value) => {
    setSearchValue(value);
  };

  const onChangeTag = (value: string[]) => {
    props.onChange(value);
  };

  return (
    <Select
      placeholder={__("Type to search...")}
      value={filtered.filter((o) => value.includes(o.value))}
      onChange={onChangeTag}
      isLoading={props.loading}
      onInputChange={onInputChange}
      options={filtered}
      isMulti={true}
    />
  );
};

export default SelectServices;
