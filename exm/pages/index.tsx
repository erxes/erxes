import AuthLayout from '../modules/layout/components/AuthLayout';
import HomeContainer from '../modules/exmFeed/containers/Home';
import React from 'react';
import SignIn from '../modules/auth/containers/SignIn';
import { useRouter } from 'next/router';

export default function Home({ currentUser }) {
  const router = useRouter();

  if (!currentUser) {
    return <AuthLayout content={<SignIn />} />;
  }

  return <HomeContainer queryParams={router.query} currentUser={currentUser} />;
}
