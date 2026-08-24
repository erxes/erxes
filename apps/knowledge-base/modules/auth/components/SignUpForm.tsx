'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/modules/ui/Button';
import { Field, TextInput } from '@/modules/ui/Field';
import { Icon } from '@/modules/ui/Icon';
import { useSession } from '../SessionProvider';

type Values = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUpForm = () => {
  const router = useRouter();
  const { signIn } = useSession();
  const [values, setValues] = useState<Values>({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Errors>({});

  const update = (key: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Errors = {};

    if (!values.name.trim()) {
      next.name = 'Нэрээ оруулна уу.';
    }

    if (!emailPattern.test(values.email.trim())) {
      next.email = 'Имэйл хаяг буруу байна.';
    }

    if (values.password.length < 6) {
      next.password = 'Нууц үг дор хаяж 6 тэмдэгт байна.';
    }

    if (values.confirm !== values.password) {
      next.confirm = 'Нууц үг таарахгүй байна.';
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    signIn({ name: values.name.trim(), email: values.email.trim() });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Нэр" htmlFor="signup-name" required error={errors.name}>
        <TextInput
          id="signup-name"
          value={values.name}
          invalid={Boolean(errors.name)}
          onChange={(event) => update('name', event.target.value)}
          placeholder="Таны нэр"
          autoComplete="name"
        />
      </Field>

      <Field label="Имэйл" htmlFor="signup-email" required error={errors.email}>
        <TextInput
          id="signup-email"
          type="email"
          value={values.email}
          invalid={Boolean(errors.email)}
          onChange={(event) => update('email', event.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
        />
      </Field>

      <Field
        label="Нууц үг"
        htmlFor="signup-password"
        required
        error={errors.password}
      >
        <TextInput
          id="signup-password"
          type="password"
          value={values.password}
          invalid={Boolean(errors.password)}
          onChange={(event) => update('password', event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>

      <Field
        label="Нууц үг давтах"
        htmlFor="signup-confirm"
        required
        error={errors.confirm}
      >
        <TextInput
          id="signup-confirm"
          type="password"
          value={values.confirm}
          invalid={Boolean(errors.confirm)}
          onChange={(event) => update('confirm', event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>

      <Button type="submit" className="w-full">
        <Icon name="user" size={16} />
        Бүртгүүлэх
      </Button>
    </form>
  );
};
