import { useForm } from 'react-hook-form';
import { Button, Checkbox, Form, Input, Select, Textarea } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { SelectSalesBoard } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectSalesBoard';
import { SelectPipeline } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectPipeline';
import { SelectStage } from '@/ebarimt/settings/stage-in-ebarimt-config/components/selects/SelectStage';
import { addEBarimtStageInConfigSchema } from '@/ebarimt/settings/stage-in-ebarimt-config/types/addEBarimtReturnConfigSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FILE_SYSTEM_TYPES } from '@/ebarimt/settings/stage-in-return-ebarimt-config/constants/ebarimtData';

export const EditConfigForm = ({
  config,
  onNewConfig,
  onSubmit,
  loading,
  onCancel,
}: any) => {
  const form = useForm({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: {
      title: config?.title || '',
      posNo: config?.posNo || '',
      destinationStageBoard: config?.destinationStageBoard || '',
      pipeline: config?.pipeline || '',
      pipelineId: config?.pipelineId || '',
      stage: config?.stage || '',
      stageId: config?.stageId || '',
      companyRD: config?.companyRD || '',
      merchantTin: config?.merchantTin || '',
      branchOfProvince:
        config?.branchOfProvince || config?.branchOfProvice || '',
      subProvince: config?.subProvince || config?.subProvice || '',
      districtCode: config?.districtCode || '',
      companyName: config?.companyName || '',
      defaultUnitedCode: config?.defaultUnitedCode || '',
      headerText: config?.headerText || '',
      branchNo: config?.branchNo || '',
      hasVat: config?.hasVat || config?.HasVat || false,
      citytaxPercent: config?.citytaxPercent || 0,
      vatPercent: config?.vatPercent || 0,
      anotherRulesOfProductsOnVat: config?.anotherRulesOfProductsOnVat || '',
      vatPayableAccount: config?.vatPayableAccount || '',
      hasAllCitytax: config?.hasAllCitytax || config?.HasAllCitytax || false,
      allCitytaxPayableAccount: config?.allCitytaxPayableAccount || '',
      footerText: config?.footerText || '',
      anotherRulesOfProductsOnCitytax:
        config?.anotherRulesOfProductsOnCitytax || '',
      withDescription: config?.withDescription || false,
      skipEbarimt: config?.skipEbarimt || false,
    },
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  const hasVat = form.watch('hasVat');
  const hasAllCitytax = form.watch('hasAllCitytax');

  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="h-full w-full mx-auto max-w-6xl px-5 py-5 flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Stage In Ebarimt Config</h1>
            <Button type="button" onClick={onNewConfig}>
              New Config
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <Form.Field
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Title</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input placeholder="Title" className="h-8" {...field} />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="destinationStageBoard"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Destination Stage Board</Form.Label>
                      <Form.Control>
                        <SelectSalesBoard
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('pipelineId', '');
                            form.setValue('stageId', '');
                          }}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="pipelineId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Pipeline</Form.Label>
                      <SelectPipeline
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('stageId', '');
                        }}
                        boardId={selectedBoardId}
                        disabled={!selectedBoardId}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="stageId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Stage</Form.Label>
                      <SelectStage
                        id="stageId"
                        variant="form"
                        value={field.value}
                        onValueChange={field.onChange}
                        pipelineId={selectedPipelineId}
                        disabled={!selectedPipelineId}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="companyName"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Company Name</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          type="text"
                          placeholder="Enter company name"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="headerText"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Header text</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Textarea
                          placeholder="Enter header text"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="footerText"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Footer text</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Textarea
                          placeholder="Enter footer text"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-lg font-semibold">with description</h1>
                    <p>When checked ebarimt with deals description</p>
                    <Form.Field
                      control={form.control}
                      name="withDescription"
                      render={({ field }) => (
                        <Form.Item className="flex items-center gap-2 space-y-0">
                          <Form.Control>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-lg font-semibold">skip Ebarimt</h1>
                    <p>When checked only print inner bill</p>
                    <Form.Field
                      control={form.control}
                      name="skipEbarimt"
                      render={({ field }) => (
                        <Form.Item className="flex items-center gap-2 space-y-0">
                          <Form.Control>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Form.Field
                  name="posNo"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Pos No</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          placeholder="Pos No"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="companyRD"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Company RD</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          placeholder="Company RD"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="merchantTin"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>MerchantTin</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          placeholder="MerchantTin"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Form.Field
                    control={form.control}
                    name="branchOfProvince"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Branch of Province</Form.Label>
                        <Form.Control>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder={'Select province'} />
                            </Select.Trigger>
                            <Select.Content>
                              {FILE_SYSTEM_TYPES.map((type) => (
                                <Select.Item
                                  key={type.value}
                                  value={type.value}
                                >
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
                    name="subProvince"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>SUB Province / District</Form.Label>
                        <Form.Control>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder={'Select district'} />
                            </Select.Trigger>
                            <Select.Content>
                              {FILE_SYSTEM_TYPES.map((type) => (
                                <Select.Item
                                  key={type.value}
                                  value={type.value}
                                >
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
                    name="districtCode"
                    control={form.control}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>District Code</Form.Label>
                        <Form.Message />
                        <Form.Control>
                          <Input
                            type="text"
                            placeholder="Enter district code"
                            className="h-8"
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
                <Form.Field
                  name="defaultUnitedCode"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Default United Code</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          type="text"
                          placeholder="Enter default united code"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="branchNo"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Branch No</Form.Label>
                      <Form.Message />
                      <Form.Control>
                        <Input
                          type="text"
                          placeholder="Enter branch number"
                          className="h-8"
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <Form.Field
                      control={form.control}
                      name="hasVat"
                      render={({ field }) => (
                        <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                          <Form.Label variant="peer">Has Vat</Form.Label>
                          <Form.Control>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Form.Control>
                        </Form.Item>
                      )}
                    />
                    {hasVat && (
                      <Form.Field
                        name="vatPercent"
                        control={form.control}
                        render={({ field }) => (
                          <Form.Item className="">
                            <Form.Label>Vat percent</Form.Label>
                            <Form.Message />
                            <Form.Control>
                              <Input
                                placeholder="Enter vat percent"
                                className="h-8 w-full"
                                {...field}
                              />
                            </Form.Control>
                          </Form.Item>
                        )}
                      />
                    )}
                    {hasVat && (
                      <Form.Field
                        name="anotherRulesOfProductsOnVat"
                        control={form.control}
                        render={({ field }) => (
                          <Form.Item className="">
                            <Form.Label>
                              Another rules of products on vat
                            </Form.Label>
                            <Form.Message />
                            <Form.Control>
                              <Input
                                placeholder="Enter vat percent"
                                className="h-8 w-full"
                                {...field}
                              />
                            </Form.Control>
                          </Form.Item>
                        )}
                      />
                    )}

                    <Form.Field
                      control={form.control}
                      name="hasAllCitytax"
                      render={({ field }) => (
                        <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                          <Form.Control>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Form.Control>
                          <Form.Label variant="peer">
                            Has all Citytax
                          </Form.Label>
                        </Form.Item>
                      )}
                    />

                    {hasAllCitytax && (
                      <Form.Field
                        name="citytaxPercent"
                        control={form.control}
                        render={({ field }) => (
                          <Form.Item className="">
                            <Form.Label>Citytax Percent</Form.Label>
                            <Form.Message />
                            <Form.Control>
                              <Input
                                placeholder="Enter citytax percent"
                                className="h-8 w-full"
                                {...field}
                              />
                            </Form.Control>
                          </Form.Item>
                        )}
                      />
                    )}
                    {!hasAllCitytax && (
                      <Form.Field
                        control={form.control}
                        name="anotherRulesOfProductsOnCitytax"
                        render={({ field }) => (
                          <Form.Item className="">
                            <Form.Label>
                              Another rules of products on citytax
                            </Form.Label>
                            <Form.Control>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <Select.Trigger>
                                  <Select.Value placeholder={'Select rule'} />
                                </Select.Trigger>
                                <Select.Content>
                                  {FILE_SYSTEM_TYPES.map((type) => (
                                    <Select.Item
                                      key={type.value}
                                      value={type.value}
                                    >
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right flex items-center justify-end gap-2 ">
            <Button
              type="button"
              variant="ghost"
              className="justify-self-end"
              onClick={onCancel}
            >
              <IconTrash className="size-4 text-destructive" />
              Delete
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
