import { NavLink } from 'react-router-dom';

const SettingSideBar = () => {
  return (
    <div className="w-64 border-r bg-background p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">MS Dynamics</h2>
      </div>

      <nav className="space-y-2">
        <NavLink
          to="/msdynamics"
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-sm transition ${
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'
            }`
          }
        >
          General config
        </NavLink>
      </nav>
    </div>
  );
};

export default SettingSideBar;
