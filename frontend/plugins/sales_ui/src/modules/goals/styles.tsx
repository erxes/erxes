

export function GoalTypesTableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <table className="w-full">
        <tbody className="[&_td]:max-w-[250px] [&&_td]:overflow-hidden [&&_td]:text-ellipsis [&&_td]:whitespace-nowrap">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function SidebarFilters({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden px-4 py-6">{children}</div>;
}

