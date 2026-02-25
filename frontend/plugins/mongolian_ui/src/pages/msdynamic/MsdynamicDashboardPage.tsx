import { Card } from 'erxes-ui/components/card';
import { Link } from 'react-router-dom';

export const MsdynamicDashboardPage = () => {
  const links = [
    { name: 'Customers', path: 'customers' },
    { name: 'Products', path: 'products' },
    { name: 'Categories', path: 'categories' },
    { name: 'Prices', path: 'prices' },
    { name: 'Synced Orders', path: 'synced-orders' },
    { name: 'Sync History', path: 'sync-history' },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">MSDynamic</h1>

      <div className="grid grid-cols-3 gap-4">
        {links.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="p-4 hover:bg-muted cursor-pointer">
              {item.name}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
