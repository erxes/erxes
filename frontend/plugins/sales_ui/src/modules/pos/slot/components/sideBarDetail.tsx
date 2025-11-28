import { useAtom } from 'jotai';
import { slotDetailAtom } from '../states/slot';
import { Button, Checkbox, ColorPicker, Input, Label } from 'erxes-ui';
import { SidebarDetailProps, SlotDetailForm } from '../types';

const SidebarDetail = ({ onSave, onCancel }: SidebarDetailProps) => {
  const [slotDetail, setSlotDetail] = useAtom(slotDetailAtom);

  const handleChange = (
    field: keyof SlotDetailForm,
    value: string | number | boolean,
  ) => {
    setSlotDetail({
      ...slotDetail,
      [field]: value,
    });
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="p-4 border-b">
        <h2 className="text-2xl text-foreground">SLOT DETAIL</h2>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <Label htmlFor="name" className="uppercase">
            Name
          </Label>
          <Input
            id="name"
            value={slotDetail.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="code" className="uppercase">
            Code
          </Label>
          <Input
            id="code"
            value={slotDetail.code}
            onChange={(e) => handleChange('code', e.target.value)}
            className="mt-1 rounded-lg"
            disabled
          />
        </div>

        <div>
          <Label htmlFor="rounded" className="uppercase">
            Rounded
          </Label>

          <Input
            id="rounded"
            type="number"
            value={slotDetail.rounded}
            onChange={(e) => handleChange('rounded', Number(e.target.value))}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="width" className="uppercase">
            Width
          </Label>
          <Input
            id="width"
            type="number"
            value={slotDetail.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="height" className="uppercase">
            Height
          </Label>
          <Input
            id="height"
            type="number"
            value={slotDetail.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="top" className="uppercase">
            Top
          </Label>
          <Input
            id="top"
            type="number"
            value={slotDetail.top}
            onChange={(e) => handleChange('top', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="left" className="uppercase">
            Left
          </Label>
          <Input
            id="left"
            type="number"
            value={slotDetail.left}
            onChange={(e) => handleChange('left', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="rotateAngle" className="uppercase">
            Rotate Angle
          </Label>
          <Input
            id="rotateAngle"
            type="number"
            value={slotDetail.rotateAngle}
            onChange={(e) => handleChange('rotateAngle', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="zIndex" className="uppercase">
            Z Index
          </Label>
          <Input
            id="zIndex"
            type="number"
            value={slotDetail.zIndex}
            onChange={(e) => handleChange('zIndex', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="color" className="uppercase">
            Color
          </Label>
          <div className="flex mt-1 space-x-2">
            <ColorPicker
              value={slotDetail.color}
              onValueChange={(val) => handleChange('color', val)}
              className="w-24 h-8"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="disabled"
              checked={slotDetail.disabled}
              onCheckedChange={(checked) =>
                handleChange('disabled', checked === true)
              }
            />

            <Label htmlFor="disabled" className="uppercase">
              Disabled
            </Label>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="destructive"
            onClick={onCancel}
            className="px-8 py-2"
          >
            Cancel
          </Button>
          <Button variant="default" onClick={onSave} className="px-8 py-2">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarDetail;
