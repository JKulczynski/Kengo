// src/api/apiClient.js
// Lokalny klient API dla MVP.
// Na razie: mocki działają zarówno w DEV, jak i w PROD (np. Vercel),
// dopóki nie podepniemy prawdziwego backendu przez VITE_API_BASE_URL.

function makeEntityMock(entityName) {
  const store = [];

  return {
    list: async () => store,
    get: async (id) => store.find((x) => x.id === id) ?? null,

    // Minimalny filter na potrzeby MVP (np. warranty_end_date != null)
    filter: async (query = {}) => {
      const hasWarrantyFilter =
        query?.warranty_end_date &&
        typeof query.warranty_end_date === "object" &&
        "$ne" in query.warranty_end_date;

      if (hasWarrantyFilter) {
        const neValue = query.warranty_end_date.$ne;
        return store.filter((x) => x.warranty_end_date !== neValue && x.warranty_end_date != null);
      }

      return store;
    },

    create: async (data) => {
      const id =
        typeof crypto !== "undefined" && crypto?.randomUUID
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

function createMockApi() {
  return {
    entities: {
      Project: makeEntityMock("Project"),
      Document: makeEntityMock("Document"),
      ProjectMember: makeEntityMock("ProjectMember"),
    },

    auth: {
      me: async () => ({ id: "dev-user", email: "dev@local", __mock: true }),
      login: async () => ({ ok: true, __mock: true }),
      logout: async () => ({ ok: true, __mock: true }),
    },

    // Minimalny stub na integracje – żeby nic nie wywalało jeśli gdzieś jest import.
    integrations: {
      Core: {
        InvokeLLM: async () => ({ ok: true, __mock: true, message: "LLM not configured yet." }),
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
}

// Jeśli kiedyś podepniemy backend:
// ustawimy VITE_API_BASE_URL na Vercelu i wtedy przełączymy na realny client.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Na dziś: jeżeli nie ma VITE_API_BASE_URL, jedziemy na mockach (DEV + PROD).
const USE_MOCKS = !API_BASE_URL;

const api = USE_MOCKS
  ? createMockApi()
  : (() => {
      // Tu w przyszłości: realny klient (fetch/axios) do Waszego backendu.
      // Na razie zostawiamy czytelny błąd, żeby było jasne co ustawić.
      throw new Error("VITE_API_BASE_URL is set, but real backend client is not implemented yet.");
    })();

export { api };
