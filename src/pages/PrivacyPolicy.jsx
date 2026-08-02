import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const s2Items = t("privacy.sections.s2.items", { returnObjects: true });
  const s3Items = t("privacy.sections.s3.items", { returnObjects: true });
  const s5Items = t("privacy.sections.s5.items", { returnObjects: true });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)", color: "var(--k-text)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: "var(--k-accent-dark)" }}>
            {t("privacy.brand")}
          </p>
          <h1 className="text-3xl font-light mb-2" style={{ color: "var(--k-text)" }}>
            {t("privacy.title")}
          </h1>
          <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>
            {t("privacy.lastUpdated")}
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed" style={{ color: "var(--k-text-muted)" }}>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s1.title")}</h2>
            <p>{t("privacy.sections.s1.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s2.title")}</h2>
            <ul className="space-y-2 list-none">
              {s2Items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s3.title")}</h2>
            <p className="mb-3">{t("privacy.sections.s3.p1")}</p>
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
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s4.title")}</h2>
            <p>{t("privacy.sections.s4.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s5.title")}</h2>
            <p className="mb-3">{t("privacy.sections.s5.p1")}</p>
            <ul className="space-y-2 list-none">
              {s5Items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--k-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s6.title")}</h2>
            <p>{t("privacy.sections.s6.p1")}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3" style={{ color: "var(--k-text)" }}>{t("privacy.sections.s7.title")}</h2>
            <p>{t("privacy.sections.s7.p1")}</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--k-border)" }}>
          <a href="/" className="text-sm" style={{ color: "var(--k-accent-dark)" }}>
            {t("privacy.backToApp")}
          </a>
        </div>

      </div>
    </div>
  );
}
