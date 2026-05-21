import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function CheckEmail() {
  const location = useLocation();
  const email = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  }, [location.search]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
            K
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            Check your email
          </h1>
          <p className="mt-3 text-gray-300">
            We sent a verification email{email ? <> to <span className="text-white font-semibold">{email}</span></> : null}.
          </p>
          <p className="mt-2 text-gray-400 text-sm">
            Open it and click <span className="text-gray-200 font-medium">Verify Email Address</span> to activate your account.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="block w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-center hover:scale-[1.02] transition-transform"
            >
              Go to Login
            </Link>
            <div className="text-sm text-gray-400">
              Didn’t receive it? Check your spam/junk folder.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

