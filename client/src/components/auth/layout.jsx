import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left section with image and welcome text */}
      {/* Welcome sẽ được sử dụng chung => Tái sử dụng code */}
      <div className="hidden  lg:flex items-center justify-center bg-black w-1/2 px-12 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://media.istockphoto.com/id/1311053726/vector/illustration-of-clothes-and-belongings.jpg?s=612x612&w=0&k=20&c=j8bEmTpr5JwT9VOtG6Isjpkc5-5_ZFy7Y6uLucxxb7Q="
          alt="Fashion Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="max-w-md space-y-6 text-center text-primary-foreground z-10 ">
          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-white  leading-normal"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Chào mừng đến với Bliss
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Cùng khám phá những xu hướng thời trang hot nhất và tạo dấu ấn phong
            cách riêng của bạn!
          </motion.p>
        </div>
      </div>

      {/* Right section with the form (Outlet) */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md space-y-8"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
