import { getDictionary, Locale } from "@/dictionaries/getDictionary";

export default async function Datenschutz ({ params }: {params: Promise<{ lang: Locale }>}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const t = dict.datenschutz;

    return (
        <div className="max-w-3xl px-6 py-12 mx-auto">
            <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-foreground">{t.title}</h1>
            
            <div className="space-y-12 text-lg text-slate-600 dark:text-slate-300">
                
                {/* SECTION 1 */}
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">{t.section1Title}</h2>
                    
                    <h3 className="font-semibold text-foreground">{t.overviewGeneralTitle}</h3>
                    <p className="mt-2 mb-6 whitespace-pre-line">{t.overviewGeneralText}</p>
                    
                    <h3 className="font-semibold text-foreground">{t.overviewDataRecordingTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.overviewDataRecordingText}</p>
                </section>

                {/* SECTION 2 */}
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">{t.section2Title}</h2>
                    
                    <p className="mt-2 mb-6 whitespace-pre-line">{t.hostingText}</p>
                    
                    <h3 className="font-semibold text-foreground">{t.externalHostingTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.externalHostingText}</p>
                </section>

                {/* SECTION 3 */}
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">{t.section3Title}</h2>
                    
                    <h3 className="mt-6 font-semibold text-foreground">{t.dataProtectionTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.dataProtectionText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.responsiblePartyTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.responsiblePartyText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.storageDurationTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.storageDurationText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.legalBasisTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.legalBasisText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.dpoTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.dpoText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.recipientsTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.recipientsText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.revocationTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.revocationText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.rightObjectTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.rightObjectText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.complaintTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.complaintText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.portabilityTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.portabilityText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.rectificationTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.rectificationText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.restrictionsTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.restrictionsText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.sslTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.sslText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.spamTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.spamText}</p>
                </section>

                {/* SECTION 4 */}
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">{t.section4Title}</h2>
                    
                    <h3 className="mt-6 font-semibold text-foreground">{t.cookiesTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.cookiesText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.usercentricsTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.usercentricsText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.dataProcessingTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.dataProcessingText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.serverLogFilesTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.serverLogFilesText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.requestByEmailTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.requestByEmailText}</p>
                </section>

                {/* SECTION 5 */}
                <section>
                    <h2 className="mb-6 text-2xl font-bold text-foreground">{t.section5Title}</h2>
                    
                    <h3 className="mt-6 font-semibold text-foreground">{t.googleFontsTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.googleFontsText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.fontAwesomeTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.fontAwesomeText}</p>

                    <h3 className="mt-6 font-semibold text-foreground">{t.googleMapsTitle}</h3>
                    <p className="mt-2 whitespace-pre-line">{t.googleMapsText}</p>
                </section>
            </div>
        </div>
    );
};