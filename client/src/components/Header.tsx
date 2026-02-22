import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-sm font-bold text-white">
            TL
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            TuneLoop
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
          >
            Home
          </Link>
          <Link
            to="/profile"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
