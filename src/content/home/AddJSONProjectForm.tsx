import { type FC, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useState, useEffect } from "react";
import type { ProjectInput } from "../../types/domain/project";
import type Network from "../../lib/Network";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { addProject } from "./projectServices";
// For clipboarding
import DefaultDialog from "../../components/dialogs/defaultDialog";

const jsonTemplate = `{
"name": "Project Name",
"description": "Project description",
"status": "Planned",
"priority": "medium",
"progress": 0,
"phase": "planning",
"risk_level": "low",
"is_active": true
}`;

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

        try {
            const projectData: ProjectInput = JSON.parse(jsonInput);

            const status = await addProject(projectManager, projectData);
            if (status >= 200 && status < 300) {
                if (setProjectRefresh) setProjectRefresh((prev) => prev + 1);
                onSubmit?.();
            } else {
                setError(`Failed to submit project. Status: ${status}`);
            }
        } catch (err) {
            setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                sx={{
                    '& textarea': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }
                }}
            />
            <div className="flex items-start gap-2 p-2 bg-purple-100 text-slate-800 rounded">
                <InfoOutlinedIcon fontSize="small" sx={{ color: 'var(--iris-primary)' }} aria-hidden="true" />
                <p className="text-sm m-0">Tip: To import multiple projects at once, provide a JSON array of project objects using the structure shown above. You may use an automated tool (for example, an LLM or a script) to transform your source data into the required JSON format before pasting and submitting it here.</p>
            </div>
            <br />
            <div className="flex flex-row gap-2">

                <Button
                    startIcon={<LibraryAddCheckOutlinedIcon />}
                    type="button"
                    onClick={copyToClipboard}
                    variant="contained"
                    color="secondary"
                    size="large"
                    aria-label="Copy JSON template to clipboard"
                >
                    Copy JSON Template
                </Button>

                {showDialog && (
                <DefaultDialog innerText="You have copied the JSON template." />
                )}


                <Button
                    startIcon={<LibraryAddCheckOutlinedIcon />}
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Add Project
                </Button>
            </div>
        </Box>
    </form>
}

export default AddJSONProjectForm;
