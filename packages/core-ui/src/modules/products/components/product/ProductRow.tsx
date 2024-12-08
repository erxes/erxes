import {
  ActionButtons,
  Button,
  FormControl,
  Icon,
  ModalTrigger,
  Tip,
  __,
} from "@erxes/ui/src";

import { IProduct } from "../../types";
import ProductForm from "@erxes/ui-products/src/containers/ProductForm";
import React from "react";
import Tags from "@erxes/ui/src/components/Tags";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import { useNavigate } from "react-router-dom";

type Props = {
  product: IProduct;
  isChecked: boolean;
  toggleBulk: (product: IProduct, isChecked?: boolean) => void;
  duplicateProduct: (_id: string) => void;
};

const Row: React.FC<Props> = (props) => {
  const { product, toggleBulk, isChecked, duplicateProduct } = props;
  const navigate = useNavigate();

  const tags = product.getTags || [];

  const trigger = (
    <Button btnStyle="link">
      <Tip text={__("Edit")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(product, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    navigate(`/settings/product-service/details/${product._id}`);
  };

  const content = (props) => <ProductForm {...props} product={product} />;

  const { _id, code, name, type, category, unitPrice } = product;

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>
        <TextInfo>{type}</TextInfo>
      </td>
      <td>{category ? category.name : ""}</td>
      <td>{(unitPrice || 0).toLocaleString()}</td>
      <td>
        <Tags tags={tags} limit={2} />
      </td>
      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit basic info"
            trigger={trigger}
            size="xl"
            content={content}
          />
          <Tip text={__("Duplicate")} placement="top">
            <Button
              id="productDuplicate"
              btnStyle="link"
              onClick={() => duplicateProduct(_id)}
              icon="copy-1"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
