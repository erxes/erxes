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
}: any) => {
  const form = useForm({
    resolver: zodResolver(addEBarimtStageInConfigSchema),
    defaultValues: {
      title: config?.title,
      posNo: config?.posNo,
      destinationStageBoard: config?.destinationStageBoard,
      pipeline: config?.pipeline,
      pipelineId: config?.pipelineId,
      stage: config?.stage,
      stageId: config?.stageId,
      companyRD: config?.companyRD,
      merchantTin: config?.merchantTin,
      branchOfProvice: config?.branchOfProvice,
      subProvice: config?.subProvice,
      districtCode: config?.districtCode,
      companyName: config?.companyName,
      defaultUnitedCode: config?.defaultUnitedCode,
      headerText: config?.headerText,
      branchNo: config?.branchNo,
      HasVat: config?.HasVat,
      vatPercent: config?.vatPercent,
      citytaxPercent: config?.citytaxPercent,
      anotherRulesOfProductsOnVat: config?.anotherRulesOfProductsOnVat,
      vatPayableAccount: config?.vatPayableAccount,
      HasAllCitytax: config?.HasAllCitytax,
      allCitytaxPayableAccount: config?.allCitytaxPayableAccount,
      footerText: config?.footerText,
      anotherRulesOfProductsOnCitytax: config?.anotherRulesOfProductsOnCitytax,
      withDescription: config?.withDescription,
      skipEbarimt: config?.skipEbarimt,
    },
  });

  const selectedBoardId = form.watch('destinationStageBoard');
  const selectedPipelineId = form.watch('pipelineId');

  const HasVat = form.watch('HasVat');
  const HasAllCitytax = form.watch('HasAllCitytax');

  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="h-full w-full mx-auto max-w-6xl px-9 py-5 flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Stage In Ebarimt Config</h1>
            <Button type="button" onClick={onNewConfig}>
              New Config
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              name="posNo"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Pos No</Form.Label>
                  <Form.Message />
                  <Form.Control>
                    <Input placeholder="Pos No" className="h-8" {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-3 gap-4">
              <Form.Field
                control={form.control}
                name="branchOfProvice"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Branch of Provice</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder={'-'} />
                        </Select.Trigger>
                        <Select.Content>
                          {FILE_SYSTEM_TYPES.map((type) => (
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
                name="subProvice"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>SUB Provice / District</Form.Label>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder={'-'} />
                        </Select.Trigger>
                        <Select.Content>
                          {FILE_SYSTEM_TYPES.map((type) => (
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
                name="districtCode"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>District Code</Form.Label>
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
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              name="defaultUnitedCode"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Default United Code</Form.Label>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              name="headerText"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Header text</Form.Label>
                  <Form.Message />
                  <Form.Control>
                    <Textarea
                      placeholder="Enter company name"
                      className="min-h-[80px]"
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
                      placeholder="Enter company name"
                      className="h-8"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Field
              name="footerText"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Footer text</Form.Label>
                  <Form.Message />
                  <Form.Control>
                    <Textarea
                      placeholder="Enter company name"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="HasVat"
                render={({ field }) => (
                  <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                    <Form.Control>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">Has Vat</Form.Label>
                  </Form.Item>
                )}
              />
              {HasVat && (
                <Form.Field
                  name="vatPercent"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item className="col-span-2">
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
              {HasVat && (
                <Form.Field
                  name="anotherRulesOfProductsOnVat"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item className="col-span-2">
                      <Form.Label>Another rules of products on vat</Form.Label>
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
                name="HasAllCitytax"
                render={({ field }) => (
                  <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
                    <Form.Control>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">Has all Citytax</Form.Label>
                  </Form.Item>
                )}
              />

              {HasAllCitytax && (
                <Form.Field
                  name="citytaxPercent"
                  control={form.control}
                  render={({ field }) => (
                    <Form.Item className="col-span-2">
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

              {!HasAllCitytax && (
                <Form.Field
                  control={form.control}
                  name="anotherRulesOfProductsOnCitytax"
                  render={({ field }) => (
                    <Form.Item className="col-span-2">
                      <Form.Label>
                        Another rules of products on citytax
                      </Form.Label>
                      <Form.Control>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder={'-'} />
                          </Select.Trigger>
                          <Select.Content>
                            {FILE_SYSTEM_TYPES.map((type) => (
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
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">with description</h1>
              <p>When checked ebarimt with deals description</p>
              <Form.Field
                control={form.control}
                name="withDescription"
                render={({ field }) => (
                  <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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
                  <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
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
          <div className="text-right flex items-center justify-end gap-2 ">
            <Button variant="ghost" className="justify-self-end">
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
