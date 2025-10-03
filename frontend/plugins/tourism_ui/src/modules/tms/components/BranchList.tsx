import {
  IconCalendarPlus,
  IconEdit,
  IconCopy,
  IconWorld,
  IconTrash,
  IconChevronDown,
} from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import { useBranchList } from '@/tms/hooks/BranchList';
import { useBranchRemove } from '@/tms/hooks/BranchRemove';
import { IBranch } from '@/tms/types/branch';
import { format } from 'date-fns';
import { EmptyList } from './EmptyList';
import { toast } from 'erxes-ui';

export const BranchList = () => {
  const { list, loading, error } = useBranchList();
  const { removeBranchById, loading: removeLoading } = useBranchRemove();

  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (index: number) => {
    setIsMenuOpen(isMenuOpen === index ? null : index);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      setIsMenuOpen(null);

      try {
        const success = await removeBranchById(branchId);

        if (success) {
          toast.success('Branch deleted successfully');
        } else {
          toast.error('Failed to delete branch');
        }
      } catch (error) {
        toast.error('Failed to delete branch');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  if (loading) return <div className="w-full p-3">Loading...</div>;
  if (error) return <div className="w-full p-3">Error loading branches</div>;
  if (!list || list.length === 0) return <EmptyList />;

  return (
    <div className="w-full p-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
        {list.map((branch: IBranch, index: number) => (
          <div
            key={branch._id}
            className="flex flex-col items-start w-full h-full p-2 bg-white shrink-0"
          >
            <div className="flex items-start self-stretch gap-4">
              <div className="flex flex-col items-start w-[290px] rounded-sm bg-white shadow-lg">
                <div className="flex items-center self-stretch justify-between px-3 h-9">
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-semibold leading-[100%] text-black font-inter">
                      {branch.name || 'Unnamed Branch'}
                    </h3>
                  </div>

                  <div
                    className="relative"
                    ref={index === isMenuOpen ? menuRef : null}
                  >
                    <button
                      onClick={() => toggleMenu(index)}
                      className="flex items-center leading-[100%] text-black font-inter gap-1 text-sm font-medium rounded-md px-1"
                    >
                      Action
                      <IconChevronDown size={18} stroke={2} />
                    </button>

                    {isMenuOpen === index && (
                      <div className="absolute right-[-5px] mt-3 py-1 bg-white rounded-lg shadow-lg border border-gray-100 w-[150px] z-10">
                        <div className="flex items-center w-full gap-3 px-4 py-2 text-left hover:bg-gray-50">
                          <IconEdit size={16} stroke={1.5} />
                          <p className="text-sm font-medium leading-[100%] text-black font-inter">
                            Manage
                          </p>
                        </div>
                        <div className="flex items-center w-full gap-3 px-4 py-2 text-left hover:bg-gray-50">
                          <IconCopy size={16} stroke={1.5} />
                          <p className="text-sm font-medium leading-[100%] text-black font-inter">
                            Duplicate
                          </p>
                        </div>
                        <div className="flex items-center w-full gap-3 px-4 py-2 text-left hover:bg-gray-50">
                          <IconWorld size={16} stroke={1.5} />
                          <p className="text-sm font-medium leading-[100%] text-black font-inter">
                            Visit website
                          </p>
                        </div>
                        <div
                          className="flex items-center w-full gap-3 px-4 py-2 text-left cursor-pointer hover:bg-gray-50"
                          onClick={() => handleDeleteBranch(branch._id)}
                        >
                          <IconTrash size={16} stroke={1.5} />
                          <p className="text-sm font-medium leading-[100%] text-black font-inter">
                            Delete
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex h-[150px] w-full flex-col items-start gap-3 self-stretch">
                  {/* Placeholder image since we don't have an image property in the data */}
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <span className="text-gray-500">
                      {branch.name?.charAt(0) || 'B'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center self-stretch justify-between px-3 h-9">
                  <div className="flex items-center gap-2">
                    <IconCalendarPlus size={12} className="text-black" />
                    <span className="text-[12px] font-semibold leading-[100%] text-black font-inter">
                      Created:{' '}
                      {branch.createdAt
                        ? format(new Date(branch.createdAt), 'dd MMM yyyy')
                        : 'N/A'}
                    </span>
                  </div>

                  {branch.user?.details?.avatar && (
                    <img
                      src={branch.user.details.avatar}
                      alt={branch.user.details.fullName || 'User avatar'}
                      className="w-6 h-6 border-2 border-white rounded-full shadow-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
