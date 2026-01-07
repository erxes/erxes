import { Button, Dialog, Input, Label, Table, Select, Form } from 'erxes-ui';
import { useState } from 'react';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { useForm } from 'react-hook-form';

type Props = {
  open: boolean;
  onClose: () => void;
  deals: any[];
};

export const PrintDialog = ({ open, onClose, deals }: Props) => {
  const form = useForm({
    defaultValues: {
      copies: 1,
      width: 300,
      brandId: '',
      branchId: '',
      departmentId: '',
      documentType: 'sales',
    },
  });

  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  const handleCheckboxChange = (dealId: string, checked: boolean) => {
    setSelectedDealIds((prev) =>
      checked ? [...prev, dealId] : prev.filter((id) => id !== dealId),
    );
  };

  const print = () => {
    //Print Logic Here
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <Dialog.Content className="sm:max-w-[700px]">
        <Form {...form}>
          <form>
            <Dialog.Header>
              <Dialog.Title>Print Document</Dialog.Title>
            </Dialog.Header>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>COPIES</Label>
                  <Form.Field
                    name="copies"
                    render={({ field }) => (
                      <Form.Item>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label>WIDTH</Label>
                  <Form.Field
                    name="width"
                    render={({ field }) => (
                      <Form.Item>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 300)
                          }
                        />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label>BRAND</Label>
                  <Form.Field
                    name="brandId"
                    render={({ field }) => (
                      <Form.Item>
                        <SelectBrand
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Choose brands"
                        />
                      </Form.Item>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Form.Field
                    name="branchId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Branches</Form.Label>
                        <SelectBranches.FormItem
                          onValueChange={field.onChange}
                          value={field.value}
                          mode="single"
                          className="focus-visible:relative focus-visible:z-10"
                        />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Form.Field
                    name="departmentId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Department</Form.Label>
                        <SelectDepartments.FormItem
                          mode="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="focus-visible:relative focus-visible:z-10"
                        />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Form.Field
                    name="documentType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>SELECT A DOCUMENT</Form.Label>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="sales">sales</Select.Item>
                          </Select.Content>
                        </Select>
                      </Form.Item>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-1/4">Number</Table.Head>
                    <Table.Head className="w-3/4">Name</Table.Head>
                    <Table.Head className="w-[50px]"></Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {deals?.length > 0 ? (
                    deals.map((deal: any, index: number) => (
                      <Table.Row key={deal._id || index}>
                        <Table.Cell className="text-center">
                          {deal.number || ``}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          {deal.name || `Deal ${index + 1}`}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedDealIds.includes(deal._id)}
                            onChange={(e) =>
                              handleCheckboxChange(deal._id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No deals found in this stage
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>

            <Dialog.Footer className="mt-6">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={() => print()}>Print</Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
