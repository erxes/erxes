import {
  Board,
  BoardColumnProps,
  Button,
  DropdownMenu,
  Skeleton,
  useConfirm,
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

import { useDealsArchive, useDeals } from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { useState, useCallback } from 'react';
import { useQueryState } from 'erxes-ui';
import {
  Dialog,
  Input,
  Label,
  Select,
  Button as UIButton,
  Combobox,
  Popover,
  Form,
} from 'erxes-ui';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';

type Props = {
  column: BoardColumnProps;
  loading: boolean;
  totalCount: number;
};

export const DealsBoardColumnHeader = ({
  column,
  loading,
  totalCount,
}: Props) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { archiveDeals } = useDealsArchive();
  const { removeStage } = useStagesRemove();
  const { editStage } = useStagesEdit();
  const { sortItems } = useStagesSortItems();
  const { confirm } = useConfirm();

  const { probability, name, id } = column;

  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [pipelineId] = useQueryState('pipelineId');

  const { deals } = useDeals({
    variables: {
      stageId: id,
      pipelineId,
    },
  });

  const handleArchiveStage = useCallback(
    (e: Event) => {
      e.preventDefault();
      confirm({
        message: `Are you sure you want to archive all cards in this list?`,
      }).then(() => {
        archiveDeals(id);
      });
    },
    [id, confirm, archiveDeals],
  );

  const handleArchiveList = useCallback(
    (e: Event) => {
      e.preventDefault();
      confirm({
        message: `Are you sure you want to archive this list?`,
      }).then(() => {
        editStage({ variables: { _id: id, status: 'archived' } });
      });
    },
    [id, confirm, editStage],
  );

  const handleRemoveStage = useCallback(
    (e: Event) => {
      e.preventDefault();
      confirm({
        message: `Are you sure you want to remove this stage?`,
      }).then(() => {
        removeStage({ variables: { _id: id } });
      });
    },
    [id, confirm, removeStage],
  );

  const handleSortOptionClick = useCallback(
    (e: Event, sortType: string) => {
      e.preventDefault();
      const processId = Math.random().toString();
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
        sortItems(id, sortType, processId);
      });
    },
    [id, confirm, sortItems],
  );

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

  const PrintDialog = ({ deals }: { deals: any[] }) => {
    const [formData, setFormData] = useState({
      copies: 1,
      width: 100,
      brandId: '',
      branchId: '',
      departmentId: '',
      documentType: 'invoice',
    });

    const handleInputChange = (field: string, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    return (
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <Dialog.Content>
          <form>
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
                    <Select.Item value="invoice">sales</Select.Item>
                    <Select.Item value="quote">sales</Select.Item>
                    <Select.Item value="receipt">sales</Select.Item>
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
                        <input type="checkbox" />
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
              <Button type="submit">Print</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog>
    );
  };

  const SortMenu = () => (
    <>
      <DropdownMenu.Item onSelect={handleBackClick}>
        <IconArrowLeft className="w-4 h-4 mr-2" />
        Back
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'created-desc')}
      >
        Date created (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'created-asc')}
      >
        Date created (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'modified-desc')}
      >
        Date modified (Newest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'modified-asc')}
      >
        Date modified (Oldest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'close-asc')}
      >
        Date assigned (Earliest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'close-desc')}
      >
        Date assigned (Latest first)
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onSelect={(e) => handleSortOptionClick(e, 'alphabetically-asc')}
      >
        Alphabetically
      </DropdownMenu.Item>
    </>
  );

  return (
    <>
      <Board.Header>
        <div className="py-2">
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
          {probability && (
            <span className="text-xs text-gray-400 pl-1">
              Forecasted ({probability})
            </span>
          )}
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
                    <DropdownMenu.Item onSelect={handleArchiveStage}>
                      Archive All Cards in This List
                      <DropdownMenu.Shortcut>⇧⌘A</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={handleArchiveList}>
                      Archive This List
                      <DropdownMenu.Shortcut>⌘B</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={handleRemoveStage}>
                      Remove stage
                      <DropdownMenu.Shortcut>⌘R</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Group>
                    <DropdownMenu.Item onSelect={handleSortMenuClick}>
                      Sort By
                      <DropdownMenu.Shortcut>⌘+S</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={handlePrint}>
                      Print document
                      <DropdownMenu.Shortcut>⌘+T</DropdownMenu.Shortcut>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </>
              ) : (
                <SortMenu />
              )}
            </DropdownMenu.Content>
          </DropdownMenu>
          <DealCreateSheetTrigger stageId={column.id} />
        </div>
      </Board.Header>
      {showPrintDialog && <PrintDialog deals={deals || []} />}
    </>
  );
};

const DealCreateSheetTrigger = ({ stageId }: { stageId: string }) => {
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDefaultValues({ stageId });
    setOpenCreateDeal(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
