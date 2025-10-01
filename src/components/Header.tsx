import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            <Link href="/" className="hover:text-gray-300">
              RU不動産 (サンプル)
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              ホーム
            </Link>
            <Link href="/map" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              地図
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
