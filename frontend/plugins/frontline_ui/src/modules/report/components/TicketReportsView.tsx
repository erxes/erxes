
import { InfoCard } from 'erxes-ui';

export const TicketReportsView = () => {
    return (
        <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <InfoCard title="Total Tickets">
                    <div className="text-2xl font-bold">0</div>
                </InfoCard>
                <InfoCard title="Resolved">
                    <div className="text-2xl font-bold">0</div>
                </InfoCard>
            </div>
            <div className="mt-8 text-center text-muted-foreground">
                Ticket reports coming soon...
            </div>
        </div>
    );
};
