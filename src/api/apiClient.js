// src/api/apiClient.js
// Lokalny klient API dla MVP.
// Na ten etap: używamy mocków zarówno lokalnie, jak i na hostingu (Vercel),
// żeby każdy mógł odpalić apkę bez backendu.
// Docelowo: podpinamy prawdziwy backend i wyłączamy mocki.

function makeEntityMock(entityName) {
  // Prosty „magazynek w pamięci” na potrzeby DEV/DEMO.
  const store = [];

  return {
    list: async () => store,
    get: async (id) => store.find((x) => x.id === id) ?? null,

    // Minimalny filter na MVP (np. warranty_end_date != null)
    filter: async (query = {}) => {
      const hasWarrantyFilter =
        query?.warranty_end_date &&
        typeof query.warranty_end_date === "object" &&
        "$ne" in query.warranty_end_date;

      if (hasWarrantyFilter) {
        const neValue = query.warranty_end_date.$ne;
        return store.filter(
          (x) => x.warranty_end_date !== neValue && x.warranty_end_date != null
        );
      }

      return store;
    },

    create: async (data) => {
      const id =
        (typeof crypto !== "undefined" && crypto.randomUUID)
          ? crypto.randomUUID()
          : `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const item = { id, ...data, __mock: true, entityName };
      store.push(item);
      return item;
    },

    update: async (id, data) => {
      const idx = store.findIndex((x) => x.id === id);

      if (idx === -1) {
        const item = { id, ...data, __mock: true, entityName };
        store.push(item);
        return item;
      }

      store[idx] = { ...store[idx], ...data, __mock: true, entityName };
      return store[idx];
    },

    delete: async (id) => {
      const idx = store.findIndex((x) => x.id === id);
      if (idx !== -1) store.splice(idx, 1);
      return { ok: true, __mock: true, entityName };
    },
  };
}

// Na tym etapie ZAWSZE używamy mocków (także na Vercel).
// Dzięki temu link działa dla innych osób bez Twojego komputera.
const api = {
  entities: {
    Project: makeEntityMock("Project"),
    Document: makeEntityMock("Document"),
    ProjectMember: makeEntityMock("ProjectMember"),
  },

  auth: {
    me: async () => ({ id: "demo-user", email: "demo@kengo", __mock: true }),
    login: async () => ({ ok: true, __mock: true }),
    logout: async () => ({ ok: true, __mock: true }),
  },

  // Minimalne stuby integracji – żeby nic nie wywalało jeśli gdzieś jest import.
  integrations: {
    Core: {
      InvokeLLM: async () => ({ ok: true, __mock: true, message: "LLM not configured" }),
      SendEmail: async () => ({ ok: true, __mock: true }),
      UploadFile: async () => ({ ok: true, __mock: true }),
      GenerateImage: async () => ({ ok: true, __mock: true }),
      ExtractDataFromUploadedFile: async () => ({ ok: true, __mock: true }),
      CreateFileSignedUrl: async () => ({ ok: true, __mock: true }),
      UploadPrivateFile: async () => ({ ok: true, __mock: true }),
    },
  },

  __mock: true,
};

export { api };
