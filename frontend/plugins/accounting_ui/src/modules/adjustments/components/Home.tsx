import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader, adjustTypes } from './Header';
import { Link } from 'react-router';

export const AdjustmentHome = () => {
	return (
		<AccountingLayout>
			<AdjustmentHeader />

			{adjustTypes.map(at => (
				<Link to={`/accounting/adjustment/${at.value}`}>
					<div>
						{at.label}

					</div>
				</Link>
			))}
		</AccountingLayout>
	);
};
