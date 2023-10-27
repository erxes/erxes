import LoginContainer from "@/modules/auth/login"

import Image from "@/components/ui/image"

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-100 p-10">
      <div className="h-full w-full grid grid-cols-2 rounded-3xl bg-white shadow-xl">
        <div>
          <div className="p-56">
            <h2 className="text-[#673FBD] text-3xl font-bold mb-4">
              {"Welcome!"}
            </h2>
            <p className="text-[#A0AEC0] mb-4">
              {"Please sign in to your account to continue"}
            </p>
            <LoginContainer />
          </div>

          <div className="flex justify-center">
            <span className="text-[#A0AEC0] text-xs">
              @ 2023, Made with ❤️ by{" "}
              <b className="text-[#6569DF]">erxes Team</b> for a better web
            </span>
          </div>
        </div>
        <div className="bg-[url('/auth-cover.png')] bg-cover rounded-3xl flex justify-center">
          <Image alt="" src="/erxes-logo-white.svg" height={100} width={200} />
        </div>
      </div>
    </div>
  )
}

export default Login
