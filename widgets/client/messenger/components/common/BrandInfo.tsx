import * as React from "react";
import { IBrand } from "../../../types";
import { __ } from "../../../utils";

type Props = {
  brand: IBrand;
};

function BrandInfo(props: Props) {
  const { brand } = props;

  return (
    <div className="welcome-info">
      <h3>{__(brand.name)}</h3>
      <div className="description">{__(brand.description)}</div>
    </div>
  );
}

export default BrandInfo;
