const PrintLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="m-2 w-[72mm] space-y-1 p-1 pb-4 text-[10px] font-light shadow-lg print:m-0 print:pb-1 print:shadow-none border-b">
      {children}
    </div>
  )
}

export default PrintLayout
