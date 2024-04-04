import * as React from 'react';
import { IProduct } from '../../types';
import { __, readFile } from '../../utils';

type Props = {
  products: IProduct[];
  onChange: (quantity: number, product?: IProduct) => void;
};

const Product = (props: Props) => {
  const { products } = props;
  const [selectedProduct, setSelectedProduct] = React.useState<
    IProduct | undefined
  >(undefined);

  const [qty, setQty] = React.useState<number>(1);

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find((p) => p._id === event.target.value);
    if (!product) {
      setQty(0);
      return setSelectedProduct(undefined);
    }

    if (qty === 0) {
      setQty(1);
    }

    setSelectedProduct(product);

    props.onChange(qty, product);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems:"center" }}>
        <div
          style={{
            width: selectedProduct && selectedProduct.attachment ? '30%' : '0',
          }}
        >
          <img
            src={readFile(
              selectedProduct?.attachment && selectedProduct.attachment.url
            )}
            style={{
              width: '100%',
              borderRadius: '8px',
              borderWidth: '1px',
              borderColor: 'grey',
            }}
          />
        </div>

        <div
          style={{
            width: selectedProduct ? '70%' : '100%',
            display: 'flex',
            marginLeft: '3px',
          }}
        >
          <select
            value={selectedProduct?._id || ''}
            onChange={onChange}
            className="form-control"
          >
            <option>-</option>
            {products.map((product, index) => (
              <option key={index} value={product._id}>
                {product.name} - {product.unitPrice}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => {
                setQty(Number(e.target.value));
                props.onChange(Number(e.target.value), selectedProduct);
              }}
              placeholder={__('quantity') as string}
              className="form-control"
              style={{ width: '80px', marginLeft: '5px' }}
            />
          )}
        </div>
      </div>
      {selectedProduct && (
        <span style={{ fontWeight: 'bold' }}>
          {selectedProduct.name}:{' '}
          {(selectedProduct.unitPrice * qty).toLocaleString()}
        </span>
      )}
    </>
  );
};

export default Product;
