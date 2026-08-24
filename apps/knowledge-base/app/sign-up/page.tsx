import Link from 'next/link';
import { getPortalIdentity } from '@/modules/layout/api';
import { AuthCard } from '@/modules/auth/components/AuthCard';
import { SignUpForm } from '@/modules/auth/components/SignUpForm';

export const metadata = { title: 'Бүртгүүлэх' };

export default async function SignUpPage() {
  const { title } = await getPortalIdentity();

  return (
    <div className="flex flex-1 flex-col justify-center bg-subtle">
      <AuthCard
        title="Бүртгүүлэх"
        subtitleBrand={title}
        subtitle="Шинэ бүртгэл үүсгээд мэдлэгийн сан, дэмжлэгийн порталыг ашиглаарай."
        footer={
          <>
            Бүртгэлтэй юу?{' '}
            <Link
              href="/sign-in"
              className="font-semibold text-brand transition-colors hover:text-brand-strong"
            >
              Нэвтрэх
            </Link>
          </>
        }
      >
        <SignUpForm />
      </AuthCard>
    </div>
  );
}
