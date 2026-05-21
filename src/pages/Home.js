import { useState, useEffect } from "react";
import { ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";


function Home() {
const location = useLocation();
const [currentFeature, setCurrentFeature] = useState(0);
const [isVisible, setIsVisible] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [showAll, setShowAll] = useState(false);

const totalSlides = 12;      
const itemsPerPage = 4;      
const maxIndex = totalSlides - itemsPerPage; 

const nextSlide = () =>
  setCurrentIndex((prev) => Math.min(prev + itemsPerPage, maxIndex));

const prevSlide = () =>
  setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));

const features = [
  {
    icon: <ShoppingBag className="w-6 h-6 text-blue-300" />,
    title: "Premium Merch",
    desc: "Official and authentic K-pop items",
    gradient: "from-blue-500/20 to-blue-400/10",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-purple-300" />,
    title: "Safe Trading",
    desc: "Community-verified, secure exchanges",
    gradient: "from-purple-500/20 to-purple-400/10",
  },
  {
    icon: <Zap className="w-6 h-6 text-pink-300" />,
    title: "Instant Access",
    desc: "Fast and seamless dashboard experience",
    gradient: "from-pink-500/20 to-pink-400/10",
  },
];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (!scrollTo || typeof scrollTo !== 'string') return;
    const run = () => {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const t = window.setTimeout(run, 80);
    return () => clearTimeout(t);
  }, [location.pathname, location.state]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-blue-500/10 rounded-full blur-2xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(56, 182, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(56, 182, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>




<div className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6">
  {/* Hero Section */}
  <section id="hero" className="w-full text-center">
    <div
      className={`transition-all duration-1000 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-joyride font-extrabold mb-6 leading-tight">
        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          K-DREAM
        </span>
        <br />
        <span className="font-alice text-4xl md:text-6xl text-white drop-shadow-md">
          MERCHANDISE
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
        The ultimate platform for K-pop enthusiasts to{" "}
        <span className="text-blue-400 font-semibold">buy</span>,{" "}
        <span className="text-purple-400 font-semibold">sell</span>, and{" "}
        <span className="text-pink-400 font-semibold">trade</span> authentic
        merchandise with fans worldwide.
      </p>

      {/* Features Row */}
      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl bg-gradient-to-br ${f.gradient} backdrop-blur-md border border-white/10 shadow-lg hover:scale-105 transition-transform`}
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-4 mx-auto">
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-300 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 transition-all">
          <Link to="/login">
            Get Started
          </Link>
        </button>
        <button className="px-8 py-3 text-lg font-semibold rounded-full border border-white/20 text-gray-200 hover:bg-white/10 transition-all"
            onClick={() => {
              const about = document.getElementById("about")

              if(about){
                about.scrollIntoView({behavior: "smooth"})
              }
            }}
        >
          Learn More
        </button>
      </div>
    </div>
  </section>


       {/* K-Pop Product Showcase */}
<section id="collections">
  <div className={`mt-16 max-w-6xl transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
    <div className="flex items-center justify-between mb-12">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Featured Collections
      </h2>
      
      {/* Navigation Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
            currentIndex === 0 
              ? 'bg-gray-500/10 border-gray-500/20 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/20'
          }`}
        >
          <span className="text-lg">←</span>
        </button>
        
        <button
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
            currentIndex >= maxIndex 
              ? 'bg-gray-500/10 border-gray-500/20 text-gray-500 cursor-not-allowed' 
              : 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/20'
          }`}
        >
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>

    {/* Collections Carousel */}
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
      >
        {/* BTS Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/bts pic.jpg" alt="BTS" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors duration-300">BTS Collection</h3>
            <p className="text-gray-400 text-xs">Latest albums & limited editions</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* BLACKPINK Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/blackpink pic.jpeg" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors duration-300">BLACKPINK Items</h3>
            <p className="text-gray-400 text-xs">Official merchandise & accessories</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* Stray Kids Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-pink-500/10 to-transparent backdrop-blur-sm border border-pink-500/20 hover:border-pink-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-pink-600 to-red-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <img src="/assets/stray kids pic.webp" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-pink-300 transition-colors duration-300">Stray Kids</h3>
            <p className="text-gray-400 text-xs">Exclusive limited edition items</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* TWICE Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/twice pic.jpg" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors duration-300">TWICE Special</h3>
            <p className="text-gray-400 text-xs">Photobooks & photo cards</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* AESPA Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-cyan-500/10 to-transparent backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-cyan-600 to-purple-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <img src="/assets/aespa pic.webp" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors duration-300">aespa Universe</h3>
            <p className="text-gray-400 text-xs">Digital & physical collectibles</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* (G)I-DLE Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                 <img src="/assets/idle pic.webp" alt="BTS" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors duration-300">(G)I-DLE Items</h3>
            <p className="text-gray-400 text-xs">Albums & exclusive merchandise</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* NMIXX Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-pink-500/10 to-transparent backdrop-blur-sm border border-pink-500/20 hover:border-pink-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-pink-600 to-orange-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/nmixx pic.webp" alt="BTS" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-orange-300 transition-colors duration-300">NMIXX Collection</h3>
            <p className="text-gray-400 text-xs">Latest releases & fan items</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* Red Velvet Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-red-500/10 to-transparent backdrop-blur-sm border border-red-500/20 hover:border-red-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-red-600 to-pink-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
               <img src="/assets/red velvet pics.webp" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-red-300 transition-colors duration-300">Red Velvet</h3>
            <p className="text-gray-400 text-xs">Classic & new era merchandise</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* EXO Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-indigo-500/10 to-transparent backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
               <img src="/assets/exo pic.webp" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-300 transition-colors duration-300">EXO Legacy</h3>
            <p className="text-gray-400 text-xs">Rare finds & collector items</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>

        {/* BABYMONSTER Collection */}
        <div className="w-1/4 flex-shrink-0 px-3">
          <div className="group relative p-4 bg-gradient-to-br from-orange-500/10 to-transparent backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-orange-600 to-red-600 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img src="/assets/baemon pic.jpeg" alt="BTS" className="w-full h-full object-cover" />

            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-orange-300 transition-colors duration-300">BABYMONSTER</h3>
            <p className="text-gray-400 text-xs">Debut collection & exclusives</p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-center pb-4">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300">
                View Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

     {/* Show More/Less Button
    <div className="flex justify-center mt-8">
      <button
        onClick={() => setShowAll(!showAll)}
        className="group relative px-8 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 text-white font-medium rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-500/50 transition-all duration-300"
      >
        <span className="relative flex items-center space-x-2">
          <span>{showAll ? 'Show Less' : 'View All Collections'}</span>
          <span className={`transform transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </span>
      </button>
    </div>  */}

    {/* Collection Stats */}
    <div className="mt-12 text-center">
      <div className="inline-flex items-center space-x-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">10+</div>
          <div className="text-xs text-gray-400">Artist Groups</div>
        </div>
        <div className="w-px h-8 bg-white/20"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">1000+</div>
          <div className="text-xs text-gray-400">Items Available</div>
        </div>
        <div className="w-px h-8 bg-white/20"></div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">50K+</div>
          <div className="text-xs text-gray-400">Happy Collectors</div>
        </div>
      </div>
    </div>
  </div>
</section>
        

{/* Trading Community Section */}
<section id="trading" className="mt-24 px-6 max-w-7xl mx-auto">
  {/* Heading */}
  <div className="text-center mb-16">
    <span className="px-6 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 text-white">
      Trading Community
    </span>
    <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
      Where Fans Connect & Trade
    </h2>
    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
      Join thousands of K-pop enthusiasts in our trusted trading hub. Whether it’s 
      <span className="text-blue-400 font-semibold"> photocards</span>, 
      <span className="text-purple-400 font-semibold"> albums</span>, or 
      <span className="text-pink-400 font-semibold"> collectibles</span>, 
      trading has never been easier—or safer.
    </p>
  </div>

  {/* How It Works - Stepper */}
  <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-12 md:gap-6">
    {/* Step 1 */}
    <div className="flex-1 text-center md:text-left">
      <div className="w-12 h-12 mx-auto md:mx-0 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xl shadow-lg">
        1
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">List Your Item</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Upload your K-pop merch with clear details and set your preferred trade.
      </p>
    </div>

    {/* Connector Line */}
    <div className="hidden md:block w-32 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400"></div>

    {/* Step 2 */}
    <div className="flex-1 text-center md:text-left">
      <div className="w-12 h-12 mx-auto md:mx-0 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white font-bold text-xl shadow-lg">
        2
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Find a Match</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Connect with traders across fandom groups and explore verified offers.
      </p>
    </div>

    {/* Connector Line */}
    <div className="hidden md:block w-32 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-400"></div>

    {/* Step 3 */}
    <div className="flex-1 text-center md:text-left">
      <div className="w-12 h-12 mx-auto md:mx-0 mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-red-500 text-white font-bold text-xl shadow-lg">
        3
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Trade Securely</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Finalize your trade with confidence through our trusted community system.
      </p>
    </div>
  </div>

  {/* CTA */}
  <div className="mt-16 text-center">
    <button className="px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 transition-all">
      <Link to="/login">
            Explore Trading Hubs
          </Link>
    </button>
  </div>
</section>


        </div>

{/* Join Community CTA */}
<section id="community" className="mt-24 text-center">
  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Be Part of Our Community</h2>
  <p className="text-gray-300 max-w-2xl mx-auto mb-8">
    Connect with fans worldwide, trade your collectibles, and celebrate 
    the love for K-pop together.
  </p>
  <Link 
    to="/login" 
    className="inline-block px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 text-white shadow-lg hover:opacity-90 transition-all cursor-pointer"
  >
    Join Now
  </Link>
</section>
      
      

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-white font-bold">K-DREAM</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">The ultimate destination for authentic K-pop merchandise and secure trading.</p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-colors cursor-pointer">
                  <span className="text-blue-400 text-xs">📧</span>
                </div>
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-colors cursor-pointer">
                  <span className="text-purple-400 text-xs">📱</span>
                </div>
                <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center hover:bg-pink-500/30 transition-colors cursor-pointer">
                  <span className="text-pink-400 text-xs">💬</span>
                </div>
              </div>
            </div>

            {/* User Roles */}
            <div>
              <h4 className="text-white font-semibold mb-4">User Access</h4>
              <ul className="space-y-3">
                <li>
                  <button className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center space-x-2">
                    <span className="text-xs">👥</span>
                    <span>Customer Portal</span>
                  </button>
                  <p className="text-gray-500 text-xs ml-5">Browse, buy & trade merch</p>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center space-x-2">
                    <span className="text-xs">🛡️</span>
                    <span>Mediator Dashboard</span>
                  </button>
                  <p className="text-gray-500 text-xs ml-5">Secure trading oversight</p>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center space-x-2">
                    <span className="text-xs">⚙️</span>
                    <span>Admin Panel</span>
                  </button>
                  <p className="text-gray-500 text-xs ml-5">Platform management</p>
                </li>
              </ul>
            </div>

            {/* Popular Groups */}
            <div>
              <h4 className="text-white font-semibold mb-4">Featured Artists</h4>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">BTS Collection</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">BLACKPINK Items</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">Stray Kids Merch</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">TWICE Specials</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">NewJeans Latest</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">View All Artists</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">Trading Guidelines</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">Authentication</button></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">Payment Help</button></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                <li><button className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2025 K-Dream Merchandise. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <button className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white transition-colors">Terms of Service</button>
              <button className="text-gray-400 hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  );
}

export default Home;
