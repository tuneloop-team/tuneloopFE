export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
        Welcome to <span className="text-primary-500">TuneLoop</span>
      </h1>
      <p className="max-w-md text-center text-lg text-gray-600">
        Discover new music, share your taste, and connect with others through
        sound.
      </p>
      <div className="mt-8 flex gap-4">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className="text-2xl font-bold text-green-600">Online</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Sprint</p>
          <p className="text-2xl font-bold text-primary-600">1</p>
        </div>
      </div>
    </div>
  );
}
