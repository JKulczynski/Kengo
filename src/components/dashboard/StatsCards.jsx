import React from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCards({ title, value, icon: Icon, gradient, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <div className={`absolute inset-0 ${gradient} opacity-5`} />
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
        
        <CardHeader className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {title}
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {value}
              </div>
              {description && (
                <p className="text-xs text-slate-400 font-medium">
                  {description}
                </p>
              )}
            </div>
            
            <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}