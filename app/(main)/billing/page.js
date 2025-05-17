'use client';

import { motion } from "framer-motion";

export default function Billing() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 shadow-lg"
      >
        <p className="text-gray-300">This is the Billing page. Implementation coming soon.</p>
      </motion.div>
    </div>
  );
}
