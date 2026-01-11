// src/api/apiClient.js
// Lokalny klient API dla MVP.
// DEV: mocki (żeby działało bez backendu).
// PROD: dopóki nie mamy backendu — też jedziemy na mockach (żeby dało się demo pokazać na Vercel).

function makeEntityMock(entityName) {
  const store = [];

  return {
    list: async () => store,
    get: async (id) => store.find((x) => x.id === id) ?? null,

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
      const item = {
        id: crypto?.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}`,
        ...data,
        __mock: true,
        entityName,
      };
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

// Jeśli kiedyś podepniemy backend, wrzucimy np. VITE_API_BASE_URL.
// Dopóki tego nie ma — produkcja ma działać na mockach, żeby demo było dostępne.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Wymuszenie mocków (opcjonalne) – env z Vercela / lokalnie.
const forcedMock =
  String(import.meta.env.VITE_USE_MOCK_API || "").toLowerCase() === "true";

// Logika:
// - w DEV zawsze mocki
// - w PROD: mocki, jeśli nie mamy backendu (brak VITE_API_BASE_URL) albo jeśli forcedMock=true
const useMockApi = import.meta.env.DEV || forcedMock || !apiBaseUrl;

let api;

if (useMockApi) {
  api = {
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

    integrations: {
      Core: {
        InvokeLLM: async () => ({
          ok: true,
          __mock: true,
          message: "LLM not configured in MVP",
        }),
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
} else {
  // Tu docelowo podpinamy prawdziwy backend (np. własny API).
  // Na dziś: jeśli ktoś ustawi VITE_API_BASE_URL, to tutaj dopisujemy fetch klienta.
  throw new Error("Backend mode enabled but client not implemented yet.");
}

export { api };
