import { Button } from 'erxes-ui';
import { Link } from 'react-router';

export const HrmIndexPage = () => (
  <div className="flex h-full items-center justify-center p-6">
    <div className="max-w-md text-center">
      <h2 className="text-lg font-semibold">HRM</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ажилтан, хөдөлгөөн, цалин бодолттой холбоотой тохиргоо болон лавлах бүртгэлүүд.
      </p>
      <Button className="mt-4" asChild>
        <Link to="/settings/hrm/config">Тохиргоо нээх</Link>
      </Button>
    </div>
  </div>
);
