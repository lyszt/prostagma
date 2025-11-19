export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string; 
  stack?: string | null;
  inserted_at?: string | null;
  updated_at?: string | null;
}

export type ProjectInput = Omit<Project, "id" | "inserted_at" | "updated_at">;
