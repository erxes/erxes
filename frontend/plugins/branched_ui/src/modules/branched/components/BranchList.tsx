import { Button, Table } from 'erxes-ui';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BRANCHES } from '@/branched/graphql/queries/branches';
import { ADD_BRANCH } from '@/branched/graphql/mutations/branches';
import { BranchSheet } from './BranchSheet';
import { useState } from 'react';

export default function BranchList() {
  const { data, loading, error } = useQuery(GET_BRANCHES);

  const [addBranchMutation] = useMutation(ADD_BRANCH);
  const [openAddSheet, setOpenAddSheet] = useState(false);
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleAddBranch = async (branchData) => {
    try {
      await addBranchMutation({
        variables: {
          doc: branchData
        }
      });
      setOpenAddSheet(false);
      // Refetch the branches
      // Note: In a real app, we would refetch or update the cache
    } catch (err) {
      console.error('Failed to add branch', err);
    }
  };

  const handleEditBranch = async (branchData) => {
    try {
      // We would need an UPDATE_BRANCH_MUTATION
      // For now, we'll just log
      console.log('Updating branch:', branchData);
      setOpenEditSheet(false);
    } catch (err) {
      console.error('Failed to edit branch', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Branches</h1>
        <Button 
          variant="outline" 
          onClick={() => setOpenAddSheet(true)}
        >
          Add Branch
        </Button>
      </div>
      
      {data?.branches?.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Address</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Manager</th>
              <th className="p-4 text-left">Active</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.branches.map((branch) => (
              <tr key={branch._id} className="border-t">
                <td className="p-4">{branch.name}</td>
                <td className="p-4">{branch.address || '-'}</td>
                <td className="p-4">{branch.phone || '-'}</td>
                <td className="p-4">{branch.email || '-'}</td>
                <td className="p-4">{branch.managerId || '-'}</td>
                <td className="p-4">{branch.isActive ? 'Yes' : 'No'}</td>
                <td className="p-4 space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setOpenEditSheet(true);
                    }}
                  >
                    Edit
                  </Button>
                  {/* 
                  <Button 
                    variant="ghost" 
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                  */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center py-8">No branches found.</p>
      )}
      
      {/* Add Branch Sheet */}
      <BranchSheet 
        open={openAddSheet} 
        onOpenChange={(open) => setOpenAddSheet(open)}
        branchData={{}}
        onSubmit={handleAddBranch}
      />
      
      {/* Edit Branch Sheet */}
      {selectedBranch && (
        <BranchSheet 
          open={openEditSheet} 
          onOpenChange={(open) => setOpenEditSheet(open)}
          branchData={selectedBranch}
          onSubmit={handleEditBranch}
        />
      )}
    </div>
  );
}