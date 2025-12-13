import React, { useState } from "react";
import { Alert, Button, Table, Dialog } from "erxes-ui";
import { toast } from 'erxes-ui';
import GoalTypeForm from "../containers/goalForm";
import GoalRow from "./goalRow";
import Sidebar from "./sidebar";
import { GoalTypesTableWrapper } from "../styles";
import { IGoalType } from "../types";

type Props = {
  goalType: IGoalType[];
  loading: boolean;
  totalCount: number;
  remove: (doc: { goalTypeIds: string[] }) => void;
  queryParams: any;
  renderEmpty?: () => React.ReactNode;
};

const GoalTypesList = ({
  goalType,
  loading,
  totalCount,
  remove,
  queryParams,
  renderEmpty,
}: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<IGoalType | null>(null);

  const openNewForm = () => {
    setSelected(null);
    setShowForm(true);
  };

  const handleDeleteOne = (id: string) => {
    try {
      remove({ goalTypeIds: [id] });
      toast({
        title: 'Success',
        description: 'Goal Type deleted',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e?.message || 'Delete failed',
      });

    }
  };

  const renderTable = () => (
    <GoalTypesTableWrapper>
      <Table className="min-w-full">
        <thead>
          <tr>
            <th>Checkbox</th>
            <th>Name</th>
            <th>Entity</th>
            <th>Board</th>
            <th>Pipeline</th>
            <th>Stage</th>
            <th>Contribution Type</th>
            <th>Metric</th>
            <th>Start</th>
            <th>End</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {goalType.map((goalType) => (
            <GoalRow
              key={goalType._id}
              goalType={goalType}
              onDelete={handleDeleteOne}
              onEdit={(gt: IGoalType) => {
                setSelected(gt);
                setShowForm(true);
              }}
            />
          ))}
        </tbody>
      </Table>
    </GoalTypesTableWrapper>
  );

  return (
    <div className="flex">
      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Goal Types ({totalCount})</h1>

          <Button variant="default" onClick={openNewForm}>
            + Add Goal Type
          </Button>
        </div>

        {/* TABLE */}
        {loading ? <div>Loading...</div> : renderTable()}
      </div>

      {/* FORM MODAL */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <Dialog.ContentCombined
          title={selected ? 'Edit Goal Type' : 'New Goal Type'}
          description="Goal type form"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <GoalTypeForm
              goalType={selected || undefined}
              closeModal={() => setShowForm(false)}
            />
          </div>
        </Dialog.ContentCombined>
      </Dialog>
    </div>
  );
};

export default GoalTypesList;
