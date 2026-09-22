import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { slotDetailAtom } from '../states/slot';
import { Checkbox, ColorPicker, Input, Label } from 'erxes-ui';
import { SidebarDetailProps, SlotDetailForm } from '../types';

const SidebarDetail = ({ onSave, onCancel }: SidebarDetailProps) => {
  const { t } = useTranslation('sales');
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
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="name" className="uppercase">
            {t('name')}
          </Label>
          <Input
            id="name"
            value={slotDetail.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="uppercase">
              {t('code')}
            </Label>
            <Input
              id="code"
              value={slotDetail.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="rounded-lg"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rounded" className="uppercase">
              {t('rounded')}
            </Label>

            <Input
              id="rounded"
              type="number"
              value={slotDetail.rounded}
              onChange={(e) => handleChange('rounded', Number(e.target.value))}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width" className="uppercase">
              {t('width')}
            </Label>
            <Input
              id="width"
              type="number"
              value={slotDetail.width}
              onChange={(e) => handleChange('width', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="uppercase">
              {t('height')}
            </Label>
            <Input
              id="height"
              type="number"
              value={slotDetail.height}
              onChange={(e) => handleChange('height', e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="top" className="uppercase">
              {t('top')}
            </Label>
            <Input
              id="top"
              type="number"
              value={slotDetail.top}
              onChange={(e) => handleChange('top', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="left" className="uppercase">
              {t('left')}
            </Label>
            <Input
              id="left"
              type="number"
              value={slotDetail.left}
              onChange={(e) => handleChange('left', e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rotateAngle" className="uppercase">
              {t('rotate-angle')}
            </Label>
            <Input
              id="rotateAngle"
              type="number"
              value={slotDetail.rotateAngle}
              onChange={(e) => handleChange('rotateAngle', e.target.value)}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zIndex" className="uppercase">
              {t('z-index')}
            </Label>
            <Input
              id="zIndex"
              type="number"
              value={slotDetail.zIndex}
              onChange={(e) => handleChange('zIndex', e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color" className="uppercase">
              {t('color')}
            </Label>
            <div className="flex space-x-2">
              <ColorPicker
                value={slotDetail.color}
                onValueChange={(val) => handleChange('color', val)}
                className="w-24 h-8"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="disabled"
              checked={slotDetail.disabled}
              onCheckedChange={(checked) =>
                handleChange('disabled', checked === true)
              }
            />

            <Label htmlFor="disabled" className="uppercase">
              {t('disabled')}
            </Label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SidebarDetail;
