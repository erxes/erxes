import Notifications from "@/modules/navbar/component/Notifications"
import Profile from "@/modules/navbar/component/Profile"

const TopNavbar = () => {
  return (
    <div className="h-[67px] border-b flex items-center justify-end fixed bg-white right-0 left-[230px] gap-4 pl-4">
      <Notifications />

      <Profile />
    </div>
  )
}

export default TopNavbar
