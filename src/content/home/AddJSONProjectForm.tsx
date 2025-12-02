import { type FC, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useState, useEffect } from "react";
import type { ProjectInput } from "../../types/domain/project";
import type Network from "../../lib/Network";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { addProject, addProjectsBulk, type BulkImportResult } from "./projectServices";
// For clipboarding
import DefaultDialog from "../../components/dialogs/defaultDialog";

const jsonTemplate = `Single project:
{
  "name": "Project Name",
  "description": "Project description",
  "status": "Planned",
  "priority": "medium",
  "progress": 0,
  "phase": "planning",
  "risk_level": "low",
  "is_active": true
}

Multiple projects (array):
[
  {
    "name": "Project 1",
    "description": "First project",
    "status": "Planned"
  },
  {
    "name": "Project 2",
    "description": "Second project",
    "status": "In progress"
  }
]`;

interface AddJSONProjectFormProps {
    projectManager: Network;
    onSubmit?: () => void;
    onCancel: () => void;
    setProjectRefresh?: Dispatch<SetStateAction<number>>;
}



const AddJSONProjectForm: FC<AddJSONProjectFormProps> = ({ onCancel, onSubmit, projectManager, setProjectRefresh }) => {
    const [jsonInput, setJsonInput] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [dialogTimerId, setDialogTimerId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);

    async function copyToClipboard() {
        await navigator.clipboard.writeText(jsonTemplate);
        setShowDialog(true);

        // clear any previous timer and set one to reset the dialog state
        if (dialogTimerId) {
            clearTimeout(dialogTimerId);
        }
        const id = window.setTimeout(() => setShowDialog(false), 2300);
        setDialogTimerId(id);
    }

    // cleanup the timer on unmount
    useEffect(() => {
        return () => {
            if (dialogTimerId) clearTimeout(dialogTimerId);
        };
    }, [dialogTimerId]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setBulkResult(null);
        setIsLoading(true);

        try {
            const parsed = JSON.parse(jsonInput);

            // Check if it's an array or single object
            if (Array.isArray(parsed)) {
                // Handle bulk import
                const result = await addProjectsBulk(projectManager, parsed);
                setBulkResult(result);

                if (result.successCount > 0) {
                    if (setProjectRefresh) setProjectRefresh((prev) => prev + 1);
                }

                // Only auto-close if all succeeded
                if (result.failureCount === 0) {
                    setTimeout(() => onSubmit?.(), 1500);
                }
            } else {
                // Handle single project
                const response = await addProject(projectManager, parsed);
                if (response.status >= 200 && response.status < 300) {
                    if (setProjectRefresh) setProjectRefresh((prev) => prev + 1);
                    setBulkResult({
                        totalProjects: 1,
                        successCount: 1,
                        failureCount: 0,
                        failures: []
                    });
                    setTimeout(() => onSubmit?.(), 1500);
                } else {
                    // Format validation errors for single project
                    let errorMessage = `Failed to submit project. Status: ${response.status}`;
                    if (response.error?.errors) {
                        const errors = Object.entries(response.error.errors)
                            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                            .join('; ');
                        errorMessage = errors;
                    }
                    setError(errorMessage);
                }
            }
        } catch (err) {
            setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }

    return <form onSubmit={handleSubmit} className="w-full bg-white z-9999 flex flex-col shadow-2xl rounded-lg h-full">
        <div className="bg-gray-200 p-4 rounded-t-lg flex items-center justify-between sticky top-0 z-50 flex-shrink-0">
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" style={{ color: 'var(--iris-primary)' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Add Project via JSON</h2>
            </div>
            <button
                type="button"
                onClick={onCancel}
                className="p-1 hover:bg-gray-300 rounded transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" style={{ color: 'var(--iris-primary)' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <Box className="flex flex-col gap-3 overflow-y-auto flex-1 p-6">
            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {isLoading && (
                <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Importing projects...
                    </Typography>
                    <LinearProgress color="secondary" />
                </Box>
            )}

            {bulkResult && (
                <Alert
                    severity={bulkResult.failureCount === 0 ? "success" : "error"}
                    icon={bulkResult.failureCount === 0 ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />}
                >
                    <Typography variant="body2" fontWeight="bold">
                        Import Complete: {bulkResult.successCount} of {bulkResult.totalProjects} projects added successfully
                    </Typography>
                    {bulkResult.failureCount > 0 && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight="bold" color="error.main" sx={{ mb: 0.5 }}>
                                {bulkResult.failureCount} project(s) failed with validation errors:
                            </Typography>
                            <Box component="ul" sx={{ margin: '4px 0', paddingLeft: '20px', '& li': { marginBottom: '8px' } }}>
                                {bulkResult.failures.map((failure, idx) => (
                                    <li key={idx}>
                                        <Typography variant="body2" component="span" fontWeight="bold" color="error.dark">
                                            {failure.projectName || `Project #${failure.index + 1}`}
                                        </Typography>
                                        <Typography variant="body2" component="span" color="error.main" sx={{ ml: 0.5 }}>
                                            - {failure.error}
                                        </Typography>
                                    </li>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Alert>
            )}

            <TextField
                required
                label="Project JSON"
                variant="outlined"
                color="secondary"
                multiline
                rows={20}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={jsonTemplate}
                fullWidth
                helperText="Paste valid JSON for one project (object) or multiple projects (array)"
                sx={{
                    '& textarea': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }
                }}
            />
            <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 text-slate-800 rounded">
                <InfoOutlinedIcon fontSize="small" sx={{ color: 'var(--iris-primary)', mt: 0.2 }} aria-hidden="true" />
                <div className="flex flex-col gap-1">
                    <p className="text-sm m-0 font-semibold">Bulk Import Tips:</p>
                    <ul className="text-sm m-0 pl-4 space-y-1">
                        <li>Use the template above as a reference for structure</li>
                        <li>For multiple projects, wrap objects in an array: <code className="bg-purple-100 px-1 rounded">[{"{...}"}, {"{...}"}]</code></li>
                        <li>All requests are processed in parallel for maximum speed</li>
                        <li>Required fields: <code className="bg-purple-100 px-1 rounded">name</code> and <code className="bg-purple-100 px-1 rounded">status</code></li>
                        <li>Use automated tools (LLMs, scripts) to convert your data to JSON format</li>
                    </ul>
                </div>
            </div>
            <br />
            <div className="flex flex-row gap-2">

                <Button
                    startIcon={<LibraryAddCheckOutlinedIcon />}
                    type="button"
                    onClick={copyToClipboard}
                    variant="text"
                    color="secondary"
                    size="large"
                    aria-label="Copy JSON template to clipboard"
                >
                    Copy Template
                </Button>

                {showDialog && (
                <DefaultDialog innerText="Template copied to clipboard" />
                )}


                <Button
                    startIcon={<LibraryAddCheckOutlinedIcon />}
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isLoading}
                >
                    {isLoading ? 'Importing...' : 'Import Project(s)'}
                </Button>
            </div>
        </Box>
    </form>
}

export default AddJSONProjectForm;
