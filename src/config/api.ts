
const API_URL = import.meta.env.VITE_API_URL;

/* -------------------- TOKEN UTILS -------------------- */
const TOKEN_KEY = "token";

export const tokenService = {
  save(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },

  decode(): any | null {
    const token = this.get();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  },

  getUser() {
    const payload = this.decode();
    return payload ? { id: payload.id, role: payload.role, email: payload.email } : null;
  },
};

/* -------------------- FETCH HELPERS -------------------- */
interface FetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

const handleResponse = async <T>(res: Response): Promise<FetchResult<T>> => {
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
};

export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<FetchResult<T>> => {
  const token = tokenService.get();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  

  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

    if (res.status === 401) {
      tokenService.clear();
    }

    return handleResponse<T>(res);
  } catch (err) {
    console.error("❌ Network or fetch error:", err);
    return {
      ok: false,
      status: 0,
      data: { message: "Network error or invalid endpoint" } as T,
    };
  }
};

// export const apiFetch = async <T = any>(
//   endpoint: string,
//   options: RequestInit = {},
//   requireAuth = true
// ): Promise<FetchResult<T>> => {
  
//   const token = tokenService.get();

//   const headers: Record<string, string> = {
//   "Content-Type": "application/json",
//   ...(options.headers as Record<string, string>),
// };

// if (requireAuth && token) {
//   headers["Authorization"] = `Bearer ${token}`;
// }
//   const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });


//   if (res.status === 401) {
//     tokenService.clear();
//   }

//   return handleResponse<T>(res);
// };

export const postJSON = async <T = any>(
  endpoint: string,
  body: any,
  requireAuth = true
) => {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  }, requireAuth);
};

/* -------------------- API ENDPOINTS -------------------- */
export const API = {
  auth: {
    login: "/api/login",
    signup: "/api/signup",
    profile: "/api/profile",
  },
  challenges: {
    all: "/api/challenge",
    byId: (id: string) => `/api/challenge/${id}`,
  },
  questions: {
    all: "/api/questions",
    byId: (id: string) => `/api/questions/${id}`,
  },
  challengeQuestions: {
    all: "/api/challenge-questions",
    byChallenge: (id: string) => `/api/challenge-questions/${id}`,
    byChallengeAndQuestion: (challengeId: string, questionId: string) =>
      `/api/challenge-questions/${challengeId}/${questionId}`,
  },
  userChallenges: {
    all: "/api/user-challenges",
    byId: (id: string) => `/api/user-challenges/${id}`,
  },
  responses: {
    all: "/api/user-responses",
    byId: (id: string) => `/api/user-responses/${id}`,
  },
};
