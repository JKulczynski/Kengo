// src/api/apiClient.js
// Lokalny klient API dla MVP.
// DEV: mocki (żeby działało bez backendu).
// PROD: na razie też może działać na mockach, jeśli ustawimy VITE_USE_MOCK_API=true na Vercel.

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function makeEntityMock(entityName) {
  const storageKey = `kengo_mock_${entityName}`;

  // Trzymamy w localStorage (żeby po odświeżeniu nie znikało).
  const loadStore = () => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(storageKey);
    return raw ? safeParse(raw, []) : [];
  };

  const saveStore = (data) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  };

  let store = loadStore();

  const newId = () => {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    return `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  return {
    list: async () => store,

    get: async (id) => store.find((x) => x.id === id) ?? null,

    // Prosty filter na MVP (np. warranty_end_date != null)
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
        id: newId(),
        ...data,
        __mock: true,
        entityName,
      };
      store = [...store, item];
      saveStore(store);
      return item;
    },

    update: async (id, data) => {
      const idx = store.findIndex((x) => x.id === id);

      if (idx === -1) {
        const item = { id, ...data, __mock: true, entityName };
        store = [...store, item];
        saveStore(store);
        return item;
      }

      const updated = { ...store[idx], ...data, __mock: true, entityName };
      store = store.map((x, i) => (i === idx ? updated : x));
      saveStore(store);
      return updated;
    },

    delete: async (id) => {
      store = store.filter((x) => x.id !== id);
      saveStore(store);
      return { ok: true, __mock: true, entityName };
    },
  };
}

let api;

// To jest klucz: na Vercel (prod) też możemy odpalić mocki sterowane env var.
const USE_MOCK_API =
  import.meta.env.DEV ||
  import.meta.env.VITE_USE_MOCK_API === "true" ||
  import.meta.env.VITE_USE_MOCK_API === "1";

if (USE_MOCK_API) {
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
          message: "LLM not configured yet",
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
  // Docelowo: tu podepniemy prawdziwy backend (np. własne API).
  // Na razie nie blokujemy deploya mockami tylko wtedy, kiedy USE_MOCK_API nie jest ustawione.
  throw new Error(
    "Backend produkcyjny nie jest jeszcze podpięty. Ustaw VITE_USE_MOCK_API=true, żeby odpalić wersję demo."
  );
}

export { api };
