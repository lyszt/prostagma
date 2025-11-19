import type { ProjectInput } from "../domain/project";

export interface AddProjectProps {
  projectManager: any; 
  projectData?: ProjectInput;
}

export interface ProjectFormProps {
  projectManager: any;
  initialData?: ProjectInput;
  onSubmit: (data: ProjectInput) => void;
  onCancel?: () => void;
}
