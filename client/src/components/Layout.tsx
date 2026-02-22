import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TuneLoop — Music Discovery Platform
      </footer>
    </div>
  );
}
