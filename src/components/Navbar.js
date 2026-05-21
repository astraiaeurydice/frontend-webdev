import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /** Go to home and scroll to a section (matches collections / trading pattern, works from any route). */
  const goToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    navigate('/', { state: { scrollTo: sectionId } });
  };

  const navBtnClass =
    "relative group text-left w-full md:w-auto";

  const navLabelClass =
    "text-gray-300 hover:text-white font-medium transition-colors duration-300";

  return (
    <nav className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-md border-b border-white/10' 
        : 'bg-black'
    }`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center py-4">
          
          <button
            type="button"
            onClick={() => goToSection('hero')}
            className="flex items-center space-x-3 group text-left"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
             <img src="/assets/kmerch_logo.png" alt="K-Dream Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-joyride text-gray-300 font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                K-DREAM
              </h1>
              <p className="text-gray-400 text-xs -mt-1">MERCHANDISE</p>
            </div>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <button type="button" onClick={() => goToSection('hero')} className={navBtnClass}>
              <span className={navLabelClass}>Home</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
            </button>
            <button type="button" onClick={() => goToSection('collections')} className={navBtnClass}>
              <span className={navLabelClass}>Collections</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
            </button>
            <button type="button" onClick={() => goToSection('trading')} className={navBtnClass}>
              <span className={navLabelClass}>Trading</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
            </button>
            <button type="button" onClick={() => goToSection('community')} className={navBtnClass}>
              <span className={navLabelClass}>Community</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></div>
            </button>
            <Link to="/about" className={navBtnClass} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={navLabelClass}>About Us</span>
            </Link>
            <Link to="/contact" className={navBtnClass} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={navLabelClass}>Contact Us</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors duration-300">
                Login
              </Link>
                <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                Register
                </Link>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-300"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-[28rem] pb-6' : 'max-h-0'
        }`}>
          <div className="border-t border-white/10 pt-6 space-y-1">
            {[
              ['Home', 'hero'],
              ['Collections', 'collections'],
              ['Trading', 'trading'],
              ['Community', 'community'],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => goToSection(id)}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors duration-300 py-2"
              >
                {label}
              </button>
            ))}
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 hover:text-white font-medium py-2">About Us</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 hover:text-white font-medium py-2">Contact Us</Link>
            
            <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left text-gray-300 hover:text-white font-medium transition-colors duration-300 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
      )}
    </nav>
  );
}

export default Navbar;
