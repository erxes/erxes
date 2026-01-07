import {
  DropdownMenu,
  Skeleton,
  useConfirm,
  Dialog,
  Input,
  Label,
  Select,
  Button,
  Combobox,
  Popover,
} from 'erxes-ui';
import { IconArrowLeft, IconDots, IconPlus } from '@tabler/icons-react';
import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import {
  useStagesEdit,
  useStagesRemove,
  useStagesSortItems,
} from '@/deals/stage/hooks/useStages';

import { BoardDealColumn } from '@/deals/types/boards';
import ItemProductProbabilities from './ItemProductProbabilities';
import { useDealsArchive, useDeals } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState, useCallback } from 'react';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';

function convertSortTypeToOrderBy(sortType: string): any {
  switch (sortType) {
    case 'created-desc':
      return { createdAt: -1 };
    case 'created-asc':
      return { createdAt: 1 };
    case 'modified-desc':
      return { modifiedAt: -1 };
    case 'modified-asc':
      return { modifiedAt: 1 };
    case 'close-desc':
      return { closeDate: -1 };
    case 'close-asc':
      return { closeDate: 1 };
    case 'alphabetically-asc':
      return { name: 1 };
    default:
      return { order: 1 };
  }
}


type PrintDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deals: any[];
  onSubmit: (formData: any, selectedDealIds: string[]) => void;
};

const PrintDialog = ({
  open,
  onOpenChange,
  deals,
  onSubmit,
}: PrintDialogProps) => {
  const [formData, setFormData] = useState({
    copies: 1,
    width: 100,
    brandId: '',
    branchId: '',
    departmentId: '',
    documentType: 'invoice',
  });
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (dealId: string, checked: boolean) => {
    setSelectedDealIds((prev) =>
      checked ? [...prev, dealId] : prev.filter((id) => id !== dealId),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedDealIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <form onSubmit={handleSubmit}>
          <Dialog.Header>
            <Dialog.Title>Print Document</Dialog.Title>
          </Dialog.Header>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="copies">Copies</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={formData.copies}
                onChange={(e) =>
                  handleInputChange('copies', parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                type="number"
                placeholder="Enter width"
                value={formData.width}
                onChange={(e) =>
                  handleInputChange('width', parseInt(e.target.value) || 100)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <SelectBrand
                value={formData.brandId}
                onValueChange={(value) =>
                  handleInputChange('brandId', value as string)
                }
                placeholder="Select a brand"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <SelectBranches
                value={formData.branchId}
                onValueChange={(value) =>
                  handleInputChange('branchId', value as string)
                }
                mode="single"
              >
                <Popover>
                  <Popover.Trigger asChild>
                    <Combobox.Trigger className="w-full">
                      <SelectBranches.Value />
                    </Combobox.Trigger>
                  </Popover.Trigger>
                  <Combobox.Content>
                    <SelectBranches.Content />
                  </Combobox.Content>
                </Popover>
              </SelectBranches>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <SelectDepartments
                value={formData.departmentId}
                onValueChange={(value) =>
                  handleInputChange('departmentId', value as string)
                }
                mode="single"
              >
                <Popover>
                  <Popover.Trigger asChild>
                    <Combobox.Trigger className="w-full">
                      <SelectDepartments.Value />
                    </Combobox.Trigger>
                  </Popover.Trigger>
                  <Combobox.Content>
                    <SelectDepartments.Content />
                  </Combobox.Content>
                </Popover>
              </SelectDepartments>
            </div>
            <div className="space-y-2">
              <Label>Select Document</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) =>
                  handleInputChange('documentType', value)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select document" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="invoice">Invoice</Select.Item>
                  <Select.Item value="quote">Quote</Select.Item>
                  <Select.Item value="receipt">Receipt</Select.Item>
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <div>
                {deals?.length > 0 ? (
                  deals.map((deal: any, index: number) => (
                    <div
                      key={deal._id || index}
                      className="py-1 flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDealIds.includes(deal._id)}
                        onChange={(e) =>
                          handleCheckboxChange(deal._id, e.target.checked)
                        }
                      />
                      <span>{deal.name || `Deal ${index + 1}`}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    No deals found in this stage
                  </div>
                )}
              </div>
            </div>
          </div>
          <Dialog.Footer className="mt-6">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Dialog.Close>
            <Button>Print</Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

type Props = {
  column: BoardDealColumn;
  loading: boolean;
  totalCount: number;
  onSort?: (orderBy: any) => void;
};

export const DealsBoardColumnHeader = ({
  column,
  loading,
  totalCount,
  onSort,
}: Props) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const { archiveDeals } = useDealsArchive();
  const { removeStage } = useStagesRemove();
  const { editStage } = useStagesEdit();
  const { sortItems } = useStagesSortItems();
  const { confirm } = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const { probability, name, _id, amount, unUsedAmount } = column;


  const { deals, loading: dealsLoading } = useDeals({
    variables: {
      stageId: _id,
    },
    skip: !showPrintDialog,
  });

  const handleArchiveStage = () => {
    confirm({
      message: `Are you sure you want to archive all cards in this list?`,
    }).then(() => {
      archiveDeals(_id);
    });
  };

  const handleArchiveList = () => {
    confirm({
      message: `Are you sure you want to archive this list?`,
    }).then(() => {
      editStage({ variables: { _id, status: 'archived' } });
    });
  };

  const handleRemoveStage = () => {
    confirm({
      message: `Are you sure you want to remove this stage?`,
    }).then(() => {
      removeStage({ variables: { _id } });
    });
  };

  const handleSortOptionClick = (sortType: string) => {
    const sortLabel =
      sortType === 'created-desc'
        ? 'Date created (Newest first)'
        : sortType === 'created-asc'
          ? 'Date created (Oldest first)'
          : sortType === 'modified-desc'
            ? 'Date modified (Newest first)'
            : sortType === 'modified-asc'
              ? 'Date modified (Oldest first)'
              : sortType === 'close-asc'
                ? 'Date assigned (Earliest first)'
                : sortType === 'close-desc'
                  ? 'Date assigned (Latest first)'
                  : 'Alphabetically';
    confirm({
      message: `Are you sure you want to sort this list by ${sortLabel}?`,
    }).then(() => {
      if (onSort) {
        const orderBy = convertSortTypeToOrderBy(sortType);
        onSort(orderBy);
      }
      sortItems(_id, sortType);
    });
    setShowSortOptions(false);
  };

  const handleBackClick = useCallback((e: Event) => {
    e.preventDefault();
    setShowSortOptions(false);
  }, []);

  const handleSortMenuClick = (e: Event) => {
    e.preventDefault();
    setShowSortOptions(true);
  };

  const handlePrint = (e: Event) => {
    e.preventDefault();
    setShowPrintDialog(true);
  };

  const handlePrintSubmit = (
    formData: any,
    selectedDealIds: string[],
  ) => {
    // console.log('Print submitted:', formData, selectedDealIds);
    setShowPrintDialog(false);
  };

  const SortMenu = () => (
    <>
      <DropdownMenu.Item onSelect={handleBackClick}>
        <IconArrowLeft className="w-4 h-4 mr-2" />
        Back
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-desc')}>
        Date created (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('created-asc')}>
        Date created (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-desc')}>
        Date modified (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('modified-asc')}>
        Date modified (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-asc')}>
        Date assigned (Earliest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item onClick={() => handleSortOptionClick('close-desc')}>
        Date assigned (Latest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => handleSortOptionClick('alphabetically-asc')}
      >
        Alphabetically
      </DropdownMenu.Item>
    </>
  );

  return (
    <div className="m-0 px-2 min-h-10 w-full font-semibold text-sm flex items-center justify-between flex-col">
      <div className="flex justify-between items-center w-full mt-1">
        <div>
          <h4 className="capitalize flex items-center gap-1 pl-1">
            {name}
            <span className="text-accent-foreground font-medium pl-1">
              {loading ? (
                <Skeleton className="size-4 rounded" />
              ) : (
                totalCount || 0
              )}
            </span>
          </h4>
        </div>
        <div className="flex items-center">
          <DropdownMenu
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setShowSortOptions(false);
              }
            }}
          >
            <DropdownMenu.Trigger asChild>
              <Button variant="ghost" size="icon" className="size-6 relative">
                <IconDots />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-56">
              {!showSortOptions ? (
                <>
                  <DropdownMenu.Label>Stage section</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onClick={handleArchiveStage}>
                      Archive All Cards in This List
                      <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleArchiveList}>
                      Archive This List
                      <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={handleRemoveStage}>
                      Remove stage
                      <DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onSelect={handleSortMenuClick}>
                      Sort By
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={handlePrint}>
                      Print Document
                      <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </>
              ) : (
                <SortMenu />
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
          <DealCreateSheetTrigger stageId={column._id} />
        </div>
      </div>
      {showPrintDialog && (
        <PrintDialog
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
          deals={deals || []}
          onSubmit={handlePrintSubmit}
        />
      )}
      <ItemProductProbabilities
        totalAmount={amount as Record<string, number> | undefined}
        unusedTotalAmount={unUsedAmount as Record<string, number> | undefined}
        probability={probability}
      />
    </div>
  );
};

const DealCreateSheetTrigger = ({ stageId }: { stageId: string }) => {
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const handleClick = () => {
    setDefaultValues({ stageId });
    setOpenCreateDeal(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
