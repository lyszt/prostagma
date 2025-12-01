import Network, { NetworkError, type NetworkResponse } from "../../lib/Network";
import type { Project, ProjectInput } from "../../types/domain/project";

interface ProjectResponse {
  data: Project;
}

/**
 * Create a project and return the status code.
 * Returns the HTTP status code of the response.
 */
async function addProject(
  projectManager: Network,
  projectData: ProjectInput,
): Promise<number> {
  try {
    const response: NetworkResponse<ProjectResponse> = await projectManager.post<ProjectResponse>(
      "projects",
      projectData,
    );
    return response.status;
  } catch (error) {
    if (error instanceof NetworkError) {
      return error.status;
    }
    console.error("Unexpected error in addProject:", error);
    return 0;
  }
}

export { addProject };