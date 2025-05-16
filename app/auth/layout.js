export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
