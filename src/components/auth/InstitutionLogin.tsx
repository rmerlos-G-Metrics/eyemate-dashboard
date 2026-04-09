/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-04-02 15:38:40
 * @modify date 2026-04-02 15:38:40
 * @desc [description]
 */

"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { UserRole } from "./AuthContainer";
import { initiateSmartLaunch } from "@/actions/smartLaunch";

interface InstitutionLoginProps {
  dictionary: any;
  role: UserRole;
  onBack: () => void;
  lang: string;
}

export default function InstitutionLogin({ dictionary, role, onBack, lang }: InstitutionLoginProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Moved to mock config, ideally fetched from an API in the future
  const clinicalProviders = [
    {
      id: "smart-launcher",
      name: dictionary.auth.institutionLogin.smartLauncher.name,
      description: dictionary.auth.institutionLogin.smartLauncher.description,
      issProvider: "https://launch.smarthealthit.org/v/r4/sim/WzIsIiIsIiIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMSwiIl0/fhir",
      issPatient: "https://launch.smarthealthit.org/v/r4/sim/WzMsIiIsIiIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMSwiIl0/fhir"
      //iss: "http://localhost:4013/v/r4/sim/eyJoIjoiMSIsImoiOiIxIn0/fhir"
    },
  ];

  const handleLaunch = () => {
    if (!selectedId || !role) return;

    //console.log("Launching with lang: ", lang)

    
    setError(null);
    
    const provider = clinicalProviders.find((p) => p.id === selectedId);
    
    if (!provider) return;

    startTransition(async () => {
      try {
        let selectedIss ="";

        if (role === "practitioner") {
            selectedIss = provider.issProvider
        } else if (role === "patient") {
            selectedIss = provider.issPatient
        }
        // pass the ROLE to the action
        await initiateSmartLaunch(selectedIss, lang);
      } catch (err) {
        console.error("SMART Launch Error:", err);
        setError("Connection failed. Please try again later.");
      }
    });    
  };

  return (
    <div className="w-full bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10 relative">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        disabled={isPending}
        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="flex flex-col items-center mb-8">
        <Image 
          src="/images/eyemate-logo.png" 
          alt="G-Metrics eyemate logo" 
          width={120}
          height={40} 
          className="object-contain mb-6"
        />
        <h2 className="text-xl font-bold tracking-tight text-slate-900 text-center">
          {dictionary.auth.institutionLogin.title}
        </h2>
        <p className="text-sm text-slate-500 mt-1 text-center font-medium">
          {dictionary.auth.institutionLogin.description} 
          <span className="text-blue-600 capitalize">
            {role === "patient"
              ? dictionary.auth.roleSelector.patient.title
              : dictionary.auth.roleSelector.medicalProfessional.title
            }
          </span>
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {clinicalProviders.map((provider) => (
          <motion.div
            key={provider.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedId(provider.id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              selectedId === provider.id
                ? "bg-health-400 border-health-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white"
                : "bg-white/60 border-slate-200 hover:border-slate-400"
            }`}
          >

            <div>
              <h3 className={`font-medium ${selectedId === provider.id ? "text-white" : "text-slate-900"}`}>
                {provider.name}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={selectedId && !isPending ? { scale: 1.02 } : {}}
        whileTap={selectedId && !isPending ? { scale: 0.98 } : {}}
        onClick={handleLaunch}
        disabled={!selectedId || isPending}
        className={`w-full py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 flex justify-center items-center ${
          selectedId
            ? "bg-blue-600 hover:bg-blue-800 text-white shadow-md"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isPending ? dictionary.auth.institutionLogin.connectingButton : dictionary.auth.institutionLogin.connectButton}
      </motion.button>
    </div>
  );
}