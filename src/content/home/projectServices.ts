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
    details?: any;
  }>;
}

/**
 * Create a project and return the status code.
 * Returns the HTTP status code of the response, and the error response if failed.
 */
async function addProject(
  projectManager: Network,
  projectData: ProjectInput,
): Promise<{ status: number; error?: any }> {
  console.log("addProject called with data:", JSON.stringify(projectData, null, 2));
  try {
    const response: NetworkResponse<ProjectResponse> = await projectManager.post<ProjectResponse>(
      "projects",
      projectData,
    );
    console.log("addProject response:", response.status, response.body);
    return { status: response.status };
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("NetworkError in addProject:", error.status, error.response);
      return { status: error.status, error: error.response };
    }
    console.error("Unexpected error in addProject:", error);
    return { status: 0, error: String(error) };
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
  console.log(`Starting bulk import of ${projects.length} projects`);

  const result: BulkImportResult = {
    totalProjects: projects.length,
    successCount: 0,
    failureCount: 0,
    failures: [],
  };

  // Create array of promises for parallel execution
  const promises = projects.map((project, index) => {
    console.log(`Queueing project ${index + 1}:`, project.name);
    return addProject(projectManager, project)
      .then(response => {
        console.log(`Project ${project.name} completed with status ${response.status}`);
        return {
          index,
          project,
          status: response.status,
          success: response.status >= 200 && response.status < 300,
          errorDetails: response.error
        };
      })
      .catch((error) => {
        console.error(`Project ${project.name} failed:`, error);
        return { index, project, status: 0, success: false, errorDetails: String(error) };
      });
  });

  // Wait for all requests to complete
  console.log(`Sending ${promises.length} parallel requests`);
  const results = await Promise.all(promises);
  console.log('All requests completed');

  // Process results
  results.forEach(({ index, project, status, success, errorDetails }) => {
    if (success) {
      result.successCount++;
    } else {
      result.failureCount++;

      // Format error message from backend validation errors
      let errorMessage = `Failed with status ${status}`;
      if (errorDetails?.errors) {
        const errors = Object.entries(errorDetails.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        errorMessage = errors;
      }

      result.failures.push({
        index,
        projectName: project.name || `Project ${index + 1}`,
        error: errorMessage,
        status,
        details: errorDetails,
      });
    }
  });

  console.log(`Bulk import complete: ${result.successCount} succeeded, ${result.failureCount} failed`);
  return result;
}

export { addProject, addProjectsBulk };