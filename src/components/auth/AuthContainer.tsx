/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-02 15:34:59
 * @modify date 2026-04-02 15:49:58
 * @desc [description]
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RoleSelector from "./RoleSelector";
import InstitutionLogin from "./InstitutionLogin";

export type UserRole = "patient" | "practitioner" | null;

interface AuthContainerProps {
  dictionary: any;
  lang: string;
}

export default function AuthContainer({ dictionary, lang }: AuthContainerProps) {
  const [role, setRole] = useState<UserRole>(null);
  const [step, setStep] = useState<"role" | "institution">("role");

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep("institution");
  };

  const handleBack = () => {
    setStep("role");
    setRole(null);
  };

  return (
    <div className="w-full max-w-md relative">
      <AnimatePresence mode="wait">
        {step === "role" && (
          <motion.div
            key="role-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <RoleSelector dictionary={dictionary} onSelect={handleRoleSelect} />
          </motion.div>
        )}

        {step === "institution" && (
          <motion.div
            key="institution-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <InstitutionLogin 
              dictionary={dictionary} 
              role={role!} 
              onBack={handleBack}
              lang={lang} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

