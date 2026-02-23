import React from 'react';

interface Relation {
  brandId: string;
  brand?: {
    name?: string;
  };
  no?: string;
}

interface Props {
  relations?: Relation[];
  loading: boolean;
}

const CustomerSidebar: React.FC<Props> = ({ relations = [], loading }) => {
  return (
    <div className="px-4 py-3 border-b">
      <h4 className="text-sm font-semibold mb-2">
        MSD Customer No
      </h4>

      {loading ? (
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      ) : relations.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No customer numbers found
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {relations.map((r) => (
            <li key={r.brandId} className="flex justify-between">
              <span>{r.brand?.name ?? r.brandId}</span>
              <span className="font-medium">{r.no ?? '-'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerSidebar;