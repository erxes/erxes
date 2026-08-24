'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/modules/ui/Button';
import { Field, TextInput } from '@/modules/ui/Field';
import { Icon } from '@/modules/ui/Icon';
import { useSession } from '../SessionProvider';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || email;

export const SignInForm = () => {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: { email?: string; password?: string } = {};

    if (!emailPattern.test(email.trim())) {
      next.email = 'Имэйл хаяг буруу байна.';
    }

    if (password.length < 6) {
      next.password = 'Нууц үг дор хаяж 6 тэмдэгт байна.';
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    signIn({ name: nameFromEmail(email.trim()), email: email.trim() });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Имэйл" htmlFor="signin-email" required error={errors.email}>
        <TextInput
          id="signin-email"
          type="email"
          value={email}
          invalid={Boolean(errors.email)}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          placeholder="name@example.com"
          autoComplete="email"
        />
      </Field>

      <Field
        label="Нууц үг"
        htmlFor="signin-password"
        required
        error={errors.password}
      >
        <TextInput
          id="signin-password"
          type="password"
          value={password}
          invalid={Boolean(errors.password)}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>

      <Button type="submit" className="w-full">
        <Icon name="lock" size={16} />
        Нэвтрэх
      </Button>
    </form>
  );
};
