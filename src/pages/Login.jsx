import React, { useState } from "react";
import { Hammer, Eye, EyeOff } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { api } from "@/api/apiClient";

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    if (mode === "register" && !fullName.trim()) return t("login.validation.fullNameRequired");
    if (mode === "register" && !/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/.test(fullName.trim())) return t("login.validation.fullNameLettersOnly");
    if (!email.trim()) return t("login.validation.emailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("login.validation.emailInvalid");
    if (!password) return t("login.validation.passwordRequired");
    if (password.length < 6) return t("login.validation.passwordTooShort");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await api.auth.login(email, password);
        onLogin();
      } else {
        const data = await api.auth.register(email, password, fullName);
        if (data.user?.identities?.length === 0) {
          setError(t("login.errors.accountExists"));
          return;
        }
        setRegistered(true);
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) setError(t("login.errors.invalidCredentials"));
      else if (msg.includes("Email not confirmed")) setError(t("login.errors.emailNotConfirmed"));
      else if (msg.includes("User already registered")) setError(t("login.errors.userAlreadyRegistered"));
      else if (msg.includes("Password should be")) setError(t("login.errors.passwordTooShort"));
      else setError(t("login.errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--k-bg)" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl apple-shadow"
        style={{
          backgroundColor: "var(--k-bg-surface)",
          border: "1px solid var(--k-border-md)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--k-accent-dark) 0%, var(--k-accent) 100%)",
            }}
          >
            <Hammer
              className="w-5 h-5"
              style={{ color: "var(--k-accent-text)", strokeWidth: 2 }}
            />
          </div>
          <div>
            <h1
              className="font-semibold text-lg"
              style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}
            >
              Kengo
            </h1>
            <p className="text-xs" style={{ color: "var(--k-text-subtle)" }}>
              {t("layout.tagline")}
            </p>
          </div>
        </div>

        {registered ? (
          <div className="text-center">
            <p className="font-semibold mb-2" style={{ color: "var(--k-text)" }}>
              {t("login.registered.title")}
            </p>
            <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>
              <Trans i18nKey="login.registered.text" values={{ email }} components={{ strong: <strong /> }} />
            </p>
            <button
              className="mt-6 text-sm font-semibold"
              style={{ color: "var(--k-accent-dark)" }}
              onClick={() => { setMode("login"); setRegistered(false); }}
            >
              {t("login.registered.goToLogin")}
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}
            >
              {mode === "login" ? t("login.heading.login") : t("login.heading.register")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--k-text-muted)" }}
                  >
                    {t("login.fields.fullName")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("login.fields.fullNamePlaceholder")}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--k-bg)",
                      border: "1px solid var(--k-border-md)",
                      color: "var(--k-text)",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--k-text-muted)" }}
                >
                  {t("login.fields.email")}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.fields.emailPlaceholder")}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--k-bg)",
                    border: "1px solid var(--k-border-md)",
                    color: "var(--k-text)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--k-text-muted)" }}
                >
                  {t("login.fields.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--k-bg)",
                      border: "1px solid var(--k-border-md)",
                      color: "var(--k-text)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--k-text-muted)" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs" style={{ color: "var(--k-err-color)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, var(--k-accent), var(--k-accent-dark))",
                  color: "var(--k-accent-text)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? t("login.submit.loading")
                  : mode === "login"
                  ? t("login.submit.login")
                  : t("login.submit.register")}
              </button>
            </form>

            <p
              className="text-center text-xs mt-6"
              style={{ color: "var(--k-text-subtle)" }}
            >
              {mode === "login" ? t("login.footer.noAccount") : t("login.footer.hasAccount")}{" "}
              <button
                className="font-semibold"
                style={{ color: "var(--k-accent-dark)" }}
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login" ? t("login.footer.register") : t("login.footer.login")}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
