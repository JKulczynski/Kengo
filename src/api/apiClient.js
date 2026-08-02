import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Parsuje sort string: '-updated_date' → { column: 'updated_date', ascending: false }
function parseSort(sortBy) {
  if (!sortBy) return null;
  const desc = sortBy.startsWith("-");
  return { column: desc ? sortBy.slice(1) : sortBy, ascending: !desc };
}

function makeEntity(tableName) {
  return {
    list: async (sortBy) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let q = supabase.from(tableName).select("*");
      const sort = parseSort(sortBy);
      if (sort) q = q.order(sort.column, { ascending: sort.ascending });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    get: async (id) => {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },

    filter: async (query = {}) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let q = supabase.from(tableName).select("*");

      for (const [key, value] of Object.entries(query)) {
        if (value && typeof value === "object" && "$ne" in value) {
          if (value.$ne === null) {
            q = q.not(key, "is", null);
          } else {
            q = q.neq(key, value.$ne);
          }
        } else {
          q = q.eq(key, value);
        }
      }

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },

    create: async (data) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: created, error } = await supabase
        .from(tableName)
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return created;
    },

    update: async (id, data) => {
      const { data: updated, error } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { ok: true };
    },
  };
}

const api = {
  entities: {
    Project: makeEntity("projects"),
    Document: makeEntity("documents"),
    ProjectMember: makeEntity("project_members"),
    Note: makeEntity("notes"),
    AnalyticsEvent: makeEntity("analytics_events"),
  },

  auth: {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      // Próbuj pobrać profil z tabeli profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return profile
        ? { id: user.id, email: user.email, ...profile }
        : { id: user.id, email: user.email, full_name: user.email };
    },

    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    register: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      return data;
    },

    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { ok: true };
    },
  },

  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, file_urls, response_json_schema }) => {
        const { data, error } = await supabase.functions.invoke("invoke-llm", {
          body: { prompt, file_urls, response_json_schema },
        });
        if (error) throw error;
        return data;
      },
      SendEmail: async () => ({ ok: true }),
      UploadFile: async ({ file }) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const compressedFile = await new Promise((resolve) => {
          if (file.type === "application/pdf") { resolve(file); return; }
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(url);
            const MAX = 1600;
            let { width, height } = img;
            if (width > MAX || height > MAX) {
              if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
              else { width = Math.round((width / height) * MAX); height = MAX; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width; canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })), "image/jpeg", 0.85);
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
          img.src = url;
        });

        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(path, compressedFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(path);
        return { file_url: publicUrl, path };
      },
      GenerateImage: async () => ({ ok: true }),
      ExtractDataFromUploadedFile: async () => ({ ok: true }),
      CreateFileSignedUrl: async (path) => {
        const { data, error } = await supabase.storage
          .from("documents")
          .createSignedUrl(path, 3600);
        if (error) throw error;
        return { url: data.signedUrl };
      },
      UploadPrivateFile: async () => ({ ok: true }),
    },
  },

  supabase,
};

export { api, supabase };
