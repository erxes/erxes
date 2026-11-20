import ClearSessionButton from "@/modules/auth/components/clearSessionButton"
import Logo from "@/modules/auth/components/logo"
import LoginContainer from "@/modules/auth/login"

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-muted md:p-10">
      <div className="relative flex h-full w-full items-center justify-center bg-background shadow-xl md:h-auto md:max-w-md md:rounded-2xl md:px-10 md:py-12">
        <ClearSessionButton />
        <div className="mx-auto w-full max-w-sm px-6 md:px-0">
          <div className="mb-8 flex w-full justify-center">
            <Logo />
          </div>
          <LoginContainer />
        </div>
      </div>
    </div>
  )
}

export default Login
