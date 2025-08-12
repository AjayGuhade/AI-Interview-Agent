import React from 'react';
 
interface LoginPopupProps {
  onClose: () => void;
}
 
const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
    function setActiveTab(arg0: string): void {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="fixed inset-0 z-50  bg-opacity-70 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm p-8 rounded-xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Login</h2>
         <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
              >
                Register
              </button>
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <span className="text-blue-500 cursor-pointer" onClick={() => setActiveTab('login')}>
                  Login
                </span>
              </p>
            </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account? <span className="text-blue-500 cursor-pointer">Register</span>
        </p>
      </div>
    </div>
  );
};
 
export default LoginPopup;
 
 