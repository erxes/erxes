import { CurrencyField, Editor, InfoCard, Input, Label } from 'erxes-ui';
import { IProductDetail, SelectCategory, SelectProductType } from 'ui-modules';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

const descriptionAtom = atomWithStorage<string | undefined>(
  'description',
  undefined,
  undefined,
  {
    getOnInit: true,
  },
);

export const ProductDetailGeneral = ({
  name,
  code,
  shortName,
  categoryId,
  currency,
  unitPrice,
  type,
}: IProductDetail) => {
  const [description, setDescription] = useAtom<string | undefined>(
    descriptionAtom,
  );
  return (
    <InfoCard title="Product Information" className="col-span-2">
      <InfoCard.Content>
        <div className="grid grid-cols-2 gap-4">
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
            <CurrencyField.SelectCurrency
              value={currency}
              onChange={() => null}
            />
          </div>
          <div className="space-y-2">
            <Label>Unit price</Label>
            <CurrencyField.ValueInput value={unitPrice} onChange={() => null} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Description</Label>
            <Editor
              isHTML={true}
              initialContent={description}
              className="h-auto"
              onChange={(value) => setDescription(value)}
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
