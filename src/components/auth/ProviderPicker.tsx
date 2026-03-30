/**
 * @author Ricardo Merlos Torres
 * @email rmerlos@g-metrics.com
 * @create date 2026-03-30 13:04:29
 * @modify date 2026-03-30 13:04:29
 * @desc Clinical Provider Picker with i18n support and SMART on FHIR launch preparation.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ProviderPickerProps {
  dictionary: any; 
}

export default function ProviderPicker({ dictionary }: ProviderPickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const clinicalProviders = [
    {
      id: "smart-launcher",
      name: dictionary.auth.providerPicker.providers.smartLauncher.name,
      description: dictionary.auth.providerPicker.providers.smartLauncher.description,
      iss: "https://launch.smarthealthit.org/v/r4/fhir",
      status: dictionary.auth.providerPicker.statusOnline,
    },
    // Future providers will be added here
  ];

  const handleLaunch = () => {
    if (!selectedId) return;
    setIsLaunching(true);

    const provider = clinicalProviders.find((p) => p.id === selectedId);

    // Placeholder for Next.js API route
    console.log(`Initiating SMART launch for ISS: ${provider?.iss}`);
  };

  return (
    <div className="w-full bg-health-100/90 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl p-8 sm:p-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
          {dictionary.auth.providerPicker.title}
        </h2>
        <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
          {dictionary.auth.providerPicker.subtitle}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {clinicalProviders.map((provider) => (
          <motion.div
            key={provider.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedId(provider.id)}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              selectedId === provider.id
                ? "bg-blue-600/90 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "bg-blue-800/10 border-blue-700 hover:border-slate-500"
            }`}
          >
            <div>
              <h3 className="text-slate-900 font-medium">{provider.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {provider.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                {provider.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={selectedId && !isLaunching ? { scale: 1.02 } : {}}
        whileTap={selectedId && !isLaunching ? { scale: 0.98 } : {}}
        onClick={handleLaunch}
        disabled={!selectedId || isLaunching}
        className={`w-full py-3 rounded-xl font-medium tracking-wide transition-all duration-300 flex justify-center items-center ${
          selectedId
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isLaunching ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full"
          />
        ) : (
          dictionary.auth.providerPicker.connectButton
        )}
      </motion.button>
    </div>
  );
}