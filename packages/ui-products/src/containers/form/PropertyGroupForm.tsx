import React, { useState, useEffect } from "react";
import SelectCategory from "@erxes/ui-forms/src/settings/properties/containers/SelectProductCategory";

const Form: React.FC<any> = props => {
  const config = props.config || {};

  const [selectCategories, setSelectCategories] = useState(
    config.categories || []
  );

  useEffect(() => {
    props.onChangeItems(selectCategories, "categories");
  }, [selectCategories]);

  const onChange = categories => {
    // this.props.onChangeItems(boardsPipelines);
    setSelectCategories(categories);
  };

  return <SelectCategory onChange={onChange} defaultValue={selectCategories} />;
};

export default Form;
