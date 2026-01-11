// src/api/apiClient.js
// Lokalny klient API dla MVP.
// Na dziś: domyślnie używamy mocków także na Vercelu, dopóki nie podepniemy backendu.

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
      const id =
        typeof crypto !== "undefined" && crypto?.randomUUID
          ? crypto.randomUUID()
          : `mock-${Date.now()}`;

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

// Jeżeli kiedyś podepniemy backend, ustawimy VITE_API_BASE_URL.
// Dopóki go nie ma -> mocki działają wszędzie (DEV i PROD).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const useMock = !apiBaseUrl;

let api;

if (useMock) {
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
          message: "LLM not configured in mock mode",
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
  // Tu docelowo podepniemy prawdziwy backend.
  // Na razie nie implementujemy, bo nie mamy serwera.
  throw new Error("Backend configured but client is not implemented yet.");
}

export { api };
