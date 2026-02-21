import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }} // Starts slightly lower and transparent
      animate={{ opacity: 1, y: 0, scale: 1 }}     // Floats up to normal position
      exit={{ opacity: 0, y: -30, scale: 0.98 }}   // Floats up and fades out on exit
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // "Ease Out Quart" for premium feel
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;