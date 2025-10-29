import { CurrencyField, Input, Label } from 'erxes-ui';
import { IProductDetail, SelectCategory, SelectProductType } from 'ui-modules';

export const ProductDetailGeneral = ({
  name,
  code,
  shortName,
  description,
  categoryId,
  currency,
  unitPrice,
  type,
}: IProductDetail) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} />
      </div>
      <div className="space-y-2">
        <Label>Code</Label>
        <Input value={code} />
      </div>
      <div className="space-y-2">
        <Label>Short Name</Label>
        <Input value={shortName} />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <SelectProductType value={type} onValueChange={() => null} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <SelectCategory selected={categoryId} onSelect={() => null} />
      </div>
      <div className="space-y-2 col-start-1">
        <Label>Currency</Label>
        <CurrencyField.SelectCurrency value={currency} onChange={() => null} />
      </div>
      <div className="space-y-2">
        <Label>Unit price</Label>
        <CurrencyField.ValueInput value={unitPrice} onChange={() => null} />
      </div>
      <div className="col-span-3">
        <Label>Description</Label>
      </div>
    </div>
  );
};
