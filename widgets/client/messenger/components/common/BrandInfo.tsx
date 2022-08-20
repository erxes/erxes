import * as React from "react";
import { IBrand } from "../../../types";

type Props = {
  brand: IBrand;
};

function BrandInfo(props: Props) {
  const { brand } = props;

  return (
    <div className="welcome-info">
      <h3>{brand.name}</h3>
      {brand.description && <div className="description">{brand.description}</div>}
    </div>
  );
}

export default BrandInfo;
