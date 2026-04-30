/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-02 15:36:04
 * @modify date 2026-04-02 15:36:04
 * @desc [description]
 */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { UserRole } from "./AuthContainer";

interface RoleSelectorProps {
  dictionary: any;
  onSelect: (role: UserRole) => void;
}

export default function RoleSelector({ dictionary, onSelect }: RoleSelectorProps) {
  return (
    <div className="w-full bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
      <div className="flex flex-col items-center mb-8">
        <Image 
          src="/images/CORA_Logo_v1.png" 
          alt="G-Metrics eyemate logo" 
          width={140}
          height={48}
          className="object-contain mb-6"
          priority
        />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
            {dictionary.auth.roleSelector.title}
        </h2>
        <p className="text-l text-slate-900 mt-2 text-center leading-relaxed">
          {dictionary.auth.roleSelector.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("patient")}
          className="w-full p-5 rounded-xl border border-blue-100 bg-white/50 hover:bg-white hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex items-center text-left group"
        >
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{dictionary.auth.roleSelector.patient.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{dictionary.auth.roleSelector.patient.description}</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("practitioner")}
          className="w-full p-5 rounded-xl border border-emerald-100 bg-white/50 hover:bg-white hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex items-center text-left group"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{dictionary.auth.roleSelector.medicalProfessional.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{dictionary.auth.roleSelector.medicalProfessional.description}</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}