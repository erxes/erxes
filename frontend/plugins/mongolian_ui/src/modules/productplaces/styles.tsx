
export const ContentBox = ({ children, id }: { children: React.ReactNode; id?: string }) => {
  return (
    <div 
      id={id}
      className="productplaces-content-box bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      {children}
    </div>
  );
};

export const LittleGroup = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="productplaces-little-group mb-4 last:mb-0">
      {children}
    </div>
  );
};

export const contentBoxClass = 'productplaces-content-box';
export const littleGroupClass = 'productplaces-little-group';