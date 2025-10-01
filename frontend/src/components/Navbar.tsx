const Navbar = () => {
  return (
    /* Navbar Example*/
    <nav className="bg-gray-800 p-4">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          Docker Compose Generator
        </div>
        <div>
          <a href="/" className="text-gray-300 hover:text-white px-3">
            Home
          </a>
          <a href="/about" className="text-gray-300 hover:text-white px-3">
            About
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
