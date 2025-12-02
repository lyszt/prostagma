import Network, { NetworkError, type NetworkResponse } from "../../lib/Network";
import type { Project, ProjectInput } from "../../types/domain/project";

interface ProjectResponse {
  data: Project;
}

export interface BulkImportResult {
  totalProjects: number;
  successCount: number;
  failureCount: number;
  failures: Array<{
    index: number;
    projectName: string;
    error: string;
    status: number;
  }>;
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

/**
 * Add multiple projects in bulk using parallel requests.
 * Returns a result object with success/failure counts and details.
 */
async function addProjectsBulk(
  projectManager: Network,
  projects: ProjectInput[],
): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    totalProjects: projects.length,
    successCount: 0,
    failureCount: 0,
    failures: [],
  };

  // Create array of promises for parallel execution
  const promises = projects.map((project, index) =>
    addProject(projectManager, project)
      .then(status => ({ index, project, status, success: status >= 200 && status < 300 }))
      .catch(() => ({ index, project, status: 0, success: false }))
  );

  // Wait for all requests to complete
  const results = await Promise.all(promises);

  // Process results
  results.forEach(({ index, project, status, success }) => {
    if (success) {
      result.successCount++;
    } else {
      result.failureCount++;
      result.failures.push({
        index,
        projectName: project.name || `Project ${index + 1}`,
        error: `Failed with status ${status}`,
        status,
      });
    }
  });

  return result;
}

export { addProject, addProjectsBulk };