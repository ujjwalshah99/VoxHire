import { redirect } from 'next/navigation';

// Redirect from the home page to the dashboard page
export default function Home() {
  redirect('/dashboard');
}
