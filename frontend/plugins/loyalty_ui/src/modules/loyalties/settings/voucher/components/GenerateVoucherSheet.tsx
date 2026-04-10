import { IconSparkles } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  Kbd,
  Select,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VoucherHotKeyScope } from '../types/VoucherHotKeyScope';
import { useGenerateVoucher } from '../hooks/useGenerateVoucher';
import { useVoucherCampaign } from '../../assignment/hooks/useSelectVoucherCampaign';

const generateVoucherSchema = z.object({
  campaignId: z.string().min(1, 'Voucher campaign is required'),
  ownerType: z.string().min(1, 'Owner type is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  status: z.string().default('active'),
});

type GenerateVoucherValues = z.infer<typeof generateVoucherSchema>;

const OWNER_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'lead', label: 'Lead' },
  { value: 'company', label: 'Company' },
  { value: 'user', label: 'User' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const GenerateVoucherSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { voucherGenerate, loading } = useGenerateVoucher();
  const { campaignList } = useVoucherCampaign();

  const form = useForm<GenerateVoucherValues>({
    resolver: zodResolver(generateVoucherSchema),
    defaultValues: {
      campaignId: '',
      ownerType: 'customer',
      ownerId: '',
      status: 'active',
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      VoucherHotKeyScope.VoucherGenerateSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(VoucherHotKeyScope.VouchersPage);
    setOpen(false);
    form.reset();
  };

  useScopedHotkeys(`g`, () => onOpen(), VoucherHotKeyScope.VouchersPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    VoucherHotKeyScope.VoucherGenerateSheet,
  );

  const handleSubmit = form.handleSubmit((data) => {
    voucherGenerate({
      variables: {
        campaignId: data.campaignId,
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        status: data.status,
      },
      onCompleted: () => {
        onClose();
      },
    });
  });

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button variant="outline">
          <IconSparkles />
          Generate voucher
          <Kbd>G</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Generate voucher</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <Form {...form}>
            <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto">
              <Form.Field
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Voucher campaign</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger
                          className={
                            field.value ? '' : 'text-muted-foreground'
                          }
                        >
                          {campaignList.find((c) => c._id === field.value)
                            ?.title || 'Select voucher campaign'}
                        </Select.Trigger>
                        <Select.Content>
                          {campaignList.map((campaign) => (
                            <Select.Item
                              key={campaign._id}
                              value={campaign._id}
                            >
                              {campaign.title || 'Unnamed campaign'}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Owner type</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          {OWNER_TYPES.find((t) => t.value === field.value)
                            ?.label || 'Select owner type'}
                        </Select.Trigger>
                        <Select.Content>
                          {OWNER_TYPES.map((type) => (
                            <Select.Item key={type.value} value={type.value}>
                              {type.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Owner ID</Form.Label>
                    <Form.Control>
                      <Input placeholder="Enter owner ID" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Status</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          {STATUS_OPTIONS.find((o) => o.value === field.value)
                            ?.label || 'Select status'}
                        </Select.Trigger>
                        <Select.Content>
                          {STATUS_OPTIONS.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                              {opt.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </Form>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end gap-2 p-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
