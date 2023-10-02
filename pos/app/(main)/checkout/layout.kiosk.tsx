import BackButton from "./components/BackButton.kiosk"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-4 space-y-4 flex flex-col justify-start h-screen">
      <div>
        <BackButton />
      </div>
      <h1 className="text-3xl font-extrabold px-5 leading-9 pb-4">
        Захиалга <br />
        баталгаажуулах
      </h1>

      {children}
    </div>
  )
}

export default Layout
