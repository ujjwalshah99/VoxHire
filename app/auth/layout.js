import { getUser } from '@/utils/supabase/actions';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }) {
    const response = await getUser();
    if(response?.data) {
        redirect('/dashboard');
    }
  return (
    <>
      {children}
    </>
  );
}
