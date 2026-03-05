import { NavLink } from 'react-router-dom';

const links = [
  { name: 'Sync History', path: '/mongolian/msdynamic/sync-history' },
  { name: 'Check Orders', path: '/mongolian/msdynamic/synced-orders' },
  { name: 'Check Categories', path: '/mongolian/msdynamic/categories' },
  { name: 'Check Products', path: '/mongolian/msdynamic/products' },
  { name: 'Check Price', path: '/mongolian/msdynamic/prices' },
  { name: 'Check Customers', path: '/mongolian/msdynamic/customers' },
];

const MsdynamicTopNav = () => {
  return (
    <div className="border-b bg-background px-6">
      <div className="flex gap-6 h-12 items-center text-sm">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `pb-3 border-b-2 ${
                isActive
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MsdynamicTopNav;
