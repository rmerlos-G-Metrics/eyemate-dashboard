import { getDictionary, Locale } from "@/dictionaries/getDictionary";

export default async function Impressum({ params }: { params: Promise<{ lang: Locale}>}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const t = dict.impressum;

    return(
        <div className="max-w-3xl px-6 py-12 mx-auto">
            <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-foreground">{t.title}</h1>
            
            <div className="space-y-8 text-lg text-slate-600 dark:text-slate-300">
                <section>
                <h2 className="font-semibold text-foreground">{t.tmg}</h2>
                <p className="mt-2 font-medium">{t.legalNoticeText}</p>
                <p className="whitespace-pre-line mt-5">{t.companyName}</p>
                <p className="whitespace-pre-line">{t.address}</p>
                </section>

                <section>
                <p className="font-semibold text-foreground">{t.register}</p>
                <p className="mt-2 whitespace-pre-line">{t.registerText}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.representedBy}</h2>
                <p className="mt-2 whitespace-pre-line">{t.representatives}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.contact}</h2>
                <p className="mt-2">{t.phone}</p>
                <p className="mt-2 whitespace-pre-line">{t.fax}</p>
                <p className="mt-2 whitespace-pre-line">{t.email}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.vat}</h2>
                <p className="mt-2 whitespace-pre-line">{t.vatText}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.responsibleContent}</h2>
                <p className="mt-2">{t.responsiblePerson}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.disputeResolutionTitle}</h2>
                <p className="mt-2">{t.disputeResolutionText}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.liabilityContentsTitle}</h2>
                <p className="mt-2">{t.liabilityContentsText}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.liabilityLinksTitle}</h2>
                <p className="mt-2">{t.liabilityLinksText}</p>
                </section>

                <section>
                <h2 className="font-semibold text-foreground">{t.copyrightTitle}</h2>
                <p className="mt-2">{t.copyrightText}</p>
                </section>
            </div>
        </div>
    );
}