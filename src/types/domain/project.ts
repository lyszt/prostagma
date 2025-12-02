export interface Stack {
  id: number;
  name: string;
  category?: string | null;
  version?: string | null;
  description?: string | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  status: string;

  // URLs
  repository_url?: string | null;
  documentation_url?: string | null;
  demo_url?: string | null;

  // Planning & Timeline
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
  priority?: "low" | "medium" | "high" | "critical";

  // Progress & Status
  progress?: number;
  phase?: "planning" | "design" | "development" | "testing" | "deployment" | "maintenance";

  // Team
  team_size?: number | null;
  lead_developer?: string | null;

  // Effort Tracking
  estimated_hours?: number | null;
  actual_hours?: number | null;

  // Risk & Management
  risk_level?: "low" | "medium" | "high";
  category?: string | null;
  is_active?: boolean;

  // Additional metadata
  tags?: string[];
  notes?: string | null;

  // Associations
  stacks?: Stack[];

  // Timestamps
  inserted_at?: string | null;
  updated_at?: string | null;
}

export type ProjectInput = Omit<Project, "id" | "inserted_at" | "updated_at" | "stacks">;

export type ProjectFormData = Partial<ProjectInput>;
