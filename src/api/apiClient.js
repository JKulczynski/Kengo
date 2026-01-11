// src/api/apiClient.js
// Lokalny klient API dla MVP.
// DEV: mocki (żeby działało bez backendu).
// PROD: na razie też może działać na mockach, jeśli ustawimy VITE_USE_MOCK_API=true

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

// najważniejsze: w produkcji też możemy włączyć mocki zmienną env z Vercela
const useMockApi =
  import.meta.env.DEV || String(import.meta.env.VITE_USE_MOCK_API) === "true";

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
} else {
  // Docelowo: tu podepniemy prawdziwy backend.
  // Na razie nie wywalamy apki w produkcji — to ma być demo/klikane.
  console.warn("Real backend not configured. Set VITE_USE_MOCK_API=true to use mocks.");
  api = {
    entities: {
      Project: makeEntityMock("Project"),
      Document: makeEntityMock("Document"),
      ProjectMember: makeEntityMock("ProjectMember"),
    },
    auth: {
      me: async () => ({ id: "prod-user", email: "prod@unknown", __mock: true }),
      login: async () => ({ ok: true, __mock: true }),
      logout: async () => ({ ok: true, __mock: true }),
    },
    integrations: { Core: {} },
    __mock: true,
  };
}

export { api };
