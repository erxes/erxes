type HeaderProps = {
  title: string;
  onNew?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, onNew }) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <h2 className="text-lg font-semibold">{title}</h2>

      {onNew && (
        <button type="button" className="btn btn-outline" onClick={onNew}>
          + New config
        </button>
      )}
    </div>
  );
};

export default Header;
