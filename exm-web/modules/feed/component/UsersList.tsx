import { useRouter } from "next/navigation"
import { IDepartment, IUser } from "@/modules/auth/types"
import { GitFork } from "lucide-react"

import Image from "@/components/ui/image"

const UsersList = ({
  users,
  departments,
}: {
  users: IUser[]
  departments?: IDepartment[]
}) => {
  const router = useRouter()

  const handleClick = (id: string) => {
    router.push(`company/team-members/detail?id=${id}`)
  }

  return (
    <>
      <div className="px-6 pt-4 max-h-[70vh] overflow-auto">
        {users.map((user: any, index: number) => (
          <div
            className="mb-4 cursor-pointer"
            key={index}
            onClick={() => handleClick(user._id)}
          >
            <div className="flex items-center justify-between mb-2 p-2 hover:bg-[#F0F0F0]">
              <div className="flex items-center">
                <div className="items-end flex mr-2">
                  <div className="w-12 h-12 rounded-full">
                    <Image
                      src={
                        (user && user.details?.avatar) || "/avatar-colored.svg"
                      }
                      alt="avatar"
                      width={60}
                      height={60}
                      className="w-12 h-12 rounded-full object-cover border border-primary"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#444]">
                    {user?.details?.fullName || user?.email}
                  </p>
                  <p className="text-xs font-medium text-[#444]">
                    {user?.details?.position || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {departments &&
          departments.map((dep: IDepartment, index: number) => (
            <div
              className="mb-4 cursor-pointer"
              key={index}
              onClick={() => handleClick(dep._id)}
            >
              <div className="flex items-center justify-between mb-2 p-2 hover:bg-[#F0F0F0]">
                <div className="flex items-center">
                  <div className="items-end flex mr-2">
                    <div className="w-12 h-12 rounded-full border border-primary flex justify-center items-center">
                      <GitFork size={20} />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#444]">
                      {dep.title}
                    </p>
                    <p className="text-xs font-medium text-[#444]">
                      Department
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}

export default UsersList