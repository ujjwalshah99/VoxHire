'use client';

import { UserProvider } from './UserContext';

// This component wraps all providers needed in the application
export function Providers({ children }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}
