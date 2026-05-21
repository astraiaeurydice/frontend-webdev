import { API_BASE_URL, API_URL, assetUrl, googleOAuthUrl } from '../config/api';

import { useState, useEffect, } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [isVisible, setIsVisible] = useState(false);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  if (token) {
    if (roles.includes("ROLE_ADMIN")) {
      navigate("/admin/dashboard", { replace: true });
    } else if (roles.includes("ROLE_STAFF")) {
      navigate("/admin/dashboard", { replace: true });
    } else if (roles.includes("ROLE_SUPPLIER")) {
      navigate("/supplier/dashboard", { replace: true });
    } else if (roles.includes("ROLE_MEDIATOR")) {
      navigate("/mediator/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }
}, []);

      
const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fullname,
        lastName: username,
        username: role,
        phoneNumber: phone,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    navigate(`/check-email?email=${encodeURIComponent(email)}`, { replace: true });
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
};


//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (isLoading) return;

//     setIsLoading(true);
//     setError("");

//     // Simulate login
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       setError(data.error || "Login failed");
//       return;
//     }

//     localStorage.setItem("token", data.token);

//     console.log("Token saved:", data.token);

//     navigate("/admin/dashboard");
//   } catch (err) {
//     setError("Something went wrong. Please try again.");
//   } finally {
//     setIsLoading(false);
//   }
// };

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(56, 182, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(56, 182, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      {/* Left Side - Logo Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-500 shadow-2xl shadow-purple-500/25">
            <div className="text-center">
              <div className="text-6xl font-black text-white mb-2">K</div>
              <div className="text-sm text-purple-100 font-medium">DREAM</div>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
            K-DREAM
          </h1>
          <p className="text-xl lg:text-2xl font-bold text-pink-400 mb-6">
            MERCHANDISE
          </p>
          
          <div className="space-y-4 text-gray-300">
            <p className="text-lg">Join the ultimate</p>
            <p className="text-lg">K-pop trading community</p>
            
            <div className="mt-8 space-y-3">
              <div className="group flex items-center justify-center space-x-3 p-3 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all duration-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-400 font-medium">Exclusive Collections</span>
              </div>
              
              <div className="group flex items-center justify-center space-x-3 p-3 bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 rounded-xl hover:border-pink-500/40 transition-all duration-300">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-pink-400 font-medium">Safe Transactions</span>
              </div>
              
              <div className="group flex items-center justify-center space-x-3 p-3 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all duration-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-blue-400 font-medium">Verified Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8 lg:p-16">
        <div className={`w-full max-w-md transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Join K-Dream
              </h2>
              <p className="text-gray-400">Create your account</p>
            </div>

            <div className="space-y-6">
              {/* First Name Field */}
              <div className="relative pt-4">
                <input
                  type="text"
                  id="firstname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="First Name"
                />
                <label
                  htmlFor="firstname"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-purple-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-purple-400"
                >
                  First Name
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Last Name Field */}
              <div className="relative pt-4">
                <input
                  type="text"
                  id="lastname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="Last Name"
                />
                <label
                  htmlFor="lastname"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-pink-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-pink-400"
                >
                  Last Name
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Email Field */}
              <div className="relative pt-4">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="Email Address"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-400"
                >
                  Email Address
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Phone Number Field */}
              <div className="relative pt-4">
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="Phone Number"
                />
                <label
                  htmlFor="phone"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-purple-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-purple-400"
                >
                  Phone Number
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Username Field */}
              <div className="relative pt-4">
                <input
                  type="text"
                  id="username"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="Username"
                />
                <label
                  htmlFor="username"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-pink-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-pink-400"
                >
                  Username
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Password Field */}
              <div className="relative pt-4">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-0 pt-4 pb-2 bg-transparent border-0 border-b border-white/20 text-white focus:outline-none transition-all duration-300 peer placeholder-transparent"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-4 text-base text-gray-400 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-400"
                >
                  Password
                </label>
                {/* Animated bottom border - expands from center */}
                <div className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300 -translate-x-1/2 w-0 peer-focus:w-full"></div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3 text-sm pt-4">
                <input 
                  type="checkbox" 
                  className="mt-1 rounded bg-transparent border border-white/20 text-purple-500 focus:ring-purple-500" 
                />
                <label className="text-gray-400 leading-relaxed">
                  I agree to the <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Terms of Service</span> and <span className="text-pink-400 hover:text-pink-300 cursor-pointer">Privacy Policy</span>
                </label>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                className="group relative w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">✨</span>
                </span>
              </button>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Already part of K-Dream?</p>
              <button className="group text-purple-400 hover:text-purple-300 font-medium transition-all duration-300">
                <Link to="/login">
                  <span className="relative">
                  Sign in to your account
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full"></div>
                </span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

