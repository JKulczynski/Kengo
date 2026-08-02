import { useTranslation } from "react-i18next";

export default function TermsOfService() {
  const { t } = useTranslation();
  const s3Items = t("terms.sections.s3.items", { returnObjects: true });
  const s4Items = t("terms.sections.s4.items", { returnObjects: true });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)", color: "var(--k-text)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "var(--k-accent-dark)" }}>
            {t("terms.brand")}
          </p>
          <h1 className="text-3xl font-light mb-2" style={{ color: "var(--k-text)" }}>
            {t("terms.title")}
          </h1>
          <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>
            {t("terms.lastUpdated")}
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "var(--k-text-muted)" }}>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s1.title")}</h2>
            <p>{t("terms.sections.s1.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s2.title")}</h2>
            <p>{t("terms.sections.s2.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s3.title")}</h2>
            <ul className="space-y-2 list-none">
              {s3Items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s4.title")}</h2>
            <p className="mb-3">{t("terms.sections.s4.p1")}</p>
            <ul className="space-y-2 list-none">
              {s4Items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s5.title")}</h2>
            <p>{t("terms.sections.s5.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s6.title")}</h2>
            <p>{t("terms.sections.s6.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s7.title")}</h2>
            <p>{t("terms.sections.s7.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s8.title")}</h2>
            <p>{t("terms.sections.s8.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("terms.sections.s9.title")}</h2>
            <p>{t("terms.sections.s9.p1")}</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--k-border)" }}>
          <a href="/" className="text-sm" style={{ color: "var(--k-accent-dark)" }}>
            {t("terms.backToApp")}
          </a>
        </div>

      </div>
    </div>
  );
}
