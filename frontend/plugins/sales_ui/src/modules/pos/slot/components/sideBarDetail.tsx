import { useAtom } from 'jotai';
import { slotDetailAtom } from '../states/slot';
import { Button, Checkbox, Input, Label } from 'erxes-ui';
import { SidebarDetailProps, SlotDetailForm } from '../types';

const SidebarDetail = ({ onSave, onCancel }: SidebarDetailProps) => {
  const [slotDetail, setSlotDetail] = useAtom(slotDetailAtom);

  const handleChange = (
    field: keyof SlotDetailForm,
    value: string | boolean,
  ) => {
    setSlotDetail({
      ...slotDetail,
      [field]: value,
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-[#5E5CFF] mb-6">SLOT DETAIL</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-500 uppercase">
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
          <Label htmlFor="code" className="text-gray-500 uppercase">
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rounded"
              checked={slotDetail.rounded}
              onCheckedChange={(checked) =>
                handleChange('rounded', checked === true)
              }
            />
            <Label htmlFor="rounded" className="text-gray-500 uppercase">
              Rounded
            </Label>
          </div>
        </div>

        <div>
          <Label htmlFor="width" className="text-gray-500 uppercase">
            Width
          </Label>
          <Input
            id="width"
            type="text"
            value={slotDetail.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="height" className="text-gray-500 uppercase">
            Height
          </Label>
          <Input
            id="height"
            type="text"
            value={slotDetail.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="top" className="text-gray-500 uppercase">
            Top
          </Label>
          <Input
            id="top"
            type="text"
            value={slotDetail.top}
            onChange={(e) => handleChange('top', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="left" className="text-gray-500 uppercase">
            Left
          </Label>
          <Input
            id="left"
            type="text"
            value={slotDetail.left}
            onChange={(e) => handleChange('left', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="rotateAngle" className="text-gray-500 uppercase">
            Rotate Angle
          </Label>
          <Input
            id="rotateAngle"
            type="text"
            value={slotDetail.rotateAngle}
            onChange={(e) => handleChange('rotateAngle', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="zIndex" className="text-gray-500 uppercase">
            Z Index
          </Label>
          <Input
            id="zIndex"
            type="text"
            value={slotDetail.zIndex}
            onChange={(e) => handleChange('zIndex', e.target.value)}
            className="mt-1 rounded-lg"
          />
        </div>

        <div>
          <Label htmlFor="color" className="text-gray-500 uppercase">
            Color
          </Label>
          <div className="flex mt-1 space-x-2">
            <Input
              id="color-picker"
              type="color"
              value={slotDetail.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              id="color"
              value={slotDetail.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1"
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
            <Label htmlFor="disabled" className="text-gray-500 uppercase">
              Disabled
            </Label>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8 py-2 text-red-500 border-red-500 hover:bg-red-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="px-8 py-2 bg-[#5E5CFF] hover:bg-[#4a48cc]"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarDetail;
