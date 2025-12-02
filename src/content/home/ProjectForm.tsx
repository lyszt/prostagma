import { type FC, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useState } from "react";
import type { ProjectInput } from "../../types/domain/project";
import type Network from "../../lib/Network";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import * as languages from "linguist-languages";
import { addProject } from "./projectServices";
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';

interface ProjectFormProps {
    projectManager: Network;
    initialData?: ProjectInput;
    onSubmit?: () => void;
    onCancel: () => void;
    setProjectRefresh?: Dispatch<SetStateAction<number>>;
    isExpanded?: boolean;
    setIsExpanded?: Dispatch<SetStateAction<boolean>>;
}

const ProjectForm: FC<ProjectFormProps> = ({ onCancel, onSubmit, projectManager, setProjectRefresh, isExpanded, setIsExpanded }) => {
    const handleToggleExpand = () => {
        if (setIsExpanded) {
            setIsExpanded(!isExpanded);
        }
    };

    // Basic fields (always visible)
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [projectStatus, setProjectStatus] = useState("Planned");

    // Stacks (always visible)
    const [stacks, setStacks] = useState<string[]>([]);

    // Get language names from linguist-languages
    const languageNames = Object.values(languages)
        .map((lang: any) => lang.name as string)
        .sort();

    // URLs
    const [repositoryUrl, setRepositoryUrl] = useState("");
    const [documentationUrl, setDocumentationUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");

    // Timeline
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

    // Progress
    const [progress, setProgress] = useState<number>(0);
    const [phase, setPhase] = useState<"planning" | "design" | "development" | "testing" | "deployment" | "maintenance">("planning");

    // Team
    const [teamSize, setTeamSize] = useState<number | "">("");
    const [leadDeveloper, setLeadDeveloper] = useState("");

    // Effort
    const [estimatedHours, setEstimatedHours] = useState<number | "">("");
    const [actualHours, setActualHours] = useState<number | "">("");

    // Risk & Management
    const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
    const [category, setCategory] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Metadata
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [notes, setNotes] = useState("");

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const handleDeleteTag = (tagToDelete: string) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    async function prepareProject(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const projectData: ProjectInput = {
            name: projectName,
            description: projectDesc || undefined,
            status: projectStatus,
            repository_url: repositoryUrl || undefined,
            documentation_url: documentationUrl || undefined,
            demo_url: demoUrl || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            deadline: deadline || undefined,
            priority,
            progress,
            phase,
            team_size: teamSize || undefined,
            lead_developer: leadDeveloper || undefined,
            estimated_hours: estimatedHours || undefined,
            actual_hours: actualHours || undefined,
            risk_level: riskLevel,
            category: category || undefined,
            is_active: isActive,
            tags: tags.length > 0 ? tags : undefined,
            notes: notes || undefined,
        };

        const status = await addProject(projectManager, projectData);
        if (status >= 200 && status < 300) {
            if (setProjectRefresh) setProjectRefresh((prev) => prev + 1);
            onSubmit?.();
        } else {
            console.warn("Failure submitting the project form. Status:", status);
        }
    }

    return <form onSubmit={prepareProject} className="w-full bg-white z-9999 flex flex-col shadow-2xl rounded-lg h-full">
        <div className={`bg-gray-200 p-4 rounded-t-lg flex items-center justify-between sticky top-0 z-50 flex-shrink-0 ${!isExpanded ? 'handle cursor-move' : ''}`}>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" style={{ color: 'var(--iris-primary)' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Add Project</h2>
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

        <Box className={`flex flex-col gap-3 overflow-y-auto flex-1 ${isExpanded ? 'p-8 max-w-7xl mx-auto w-full' : 'p-6'}`}>
            {/* Minimal View - Always Visible */}
            <TextField
                required
                label="Project Name"
                variant="outlined"
                color="secondary"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                fullWidth
            />
            <TextField
                label="Description"
                variant="outlined"
                color="secondary"
                multiline
                rows={2}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                fullWidth
            />
            <Autocomplete
                value={projectStatus}
                onChange={(_event, newValue) => setProjectStatus(newValue || "Planned")}
                options={["Planned", "In progress", "On hold", "Completed", "Abandoned"]}
                renderInput={(params) => <TextField {...params} label="Status" required />}
                slotProps={{ popper: { style: { zIndex: 20000 } } }}
            />

            {/* Stacks Input with Autocomplete */}
            <div>
                <Autocomplete
                    multiple
                    options={languageNames}
                    value={stacks}
                    onChange={(_event, newValue) => setStacks(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Stacks/Technologies"
                            placeholder="Select languages and frameworks"
                            color="secondary"
                        />
                    )}
                    slotProps={{
                        popper: { style: { zIndex: 20000 } },
                        chip: {
                            color: "secondary",
                            size: "small"
                        }
                    }}
                />
            </div>

            {/* More Options Toggle */}
            <Button
                onClick={handleToggleExpand}
                variant="outlined"
                color="secondary"
                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                fullWidth
                sx={{ mt: 1 }}
            >
                {isExpanded ? "Less Options" : "More Options"}
            </Button>

            {/* Expanded View - Additional Fields */}
            {isExpanded && (
                <>
                    <Divider sx={{ mt: 2 }} />

                    {/* Two Column Layout - Only when expanded */}
                    <div className={`flex gap-6 ${isExpanded ? 'flex-row' : 'flex-col'}`}>
                        {/* Left Column */}
                        <div className="flex-1 flex flex-col gap-3">
                            {/* URLs */}
                            <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 'bold' }}>
                                URLs
                            </Typography>
                            <TextField
                                label="Repository URL"
                                variant="outlined"
                                color="secondary"
                                type="url"
                                value={repositoryUrl}
                                onChange={(e) => setRepositoryUrl(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Documentation URL"
                                variant="outlined"
                                color="secondary"
                                type="url"
                                value={documentationUrl}
                                onChange={(e) => setDocumentationUrl(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Demo URL"
                                variant="outlined"
                                color="secondary"
                                type="url"
                                value={demoUrl}
                                onChange={(e) => setDemoUrl(e.target.value)}
                                fullWidth
                                size="small"
                            />

                            <Divider sx={{ mt: 1 }} />

                            {/* Timeline & Priority */}
                            <Typography variant="subtitle1" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Timeline & Priority
                            </Typography>
                            <TextField
                                label="Start Date"
                                variant="outlined"
                                color="secondary"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="End Date"
                                variant="outlined"
                                color="secondary"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Deadline"
                                variant="outlined"
                                color="secondary"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Autocomplete
                                value={priority}
                                onChange={(_event, newValue) => setPriority((newValue || "medium") as any)}
                                options={["low", "medium", "high", "critical"]}
                                renderInput={(params) => <TextField {...params} label="Priority" size="small" />}
                                slotProps={{ popper: { style: { zIndex: 20000 } } }}
                            />

                            <Divider sx={{ mt: 1 }} />

                            {/* Progress & Phase */}
                            <Typography variant="subtitle1" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Progress & Phase
                            </Typography>
                            <TextField
                                label="Progress (%)"
                                variant="outlined"
                                color="secondary"
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                value={progress}
                                onChange={(e) => setProgress(Number(e.target.value))}
                                fullWidth
                                size="small"
                            />
                            <Autocomplete
                                value={phase}
                                onChange={(_event, newValue) => setPhase((newValue || "planning") as any)}
                                options={["planning", "design", "development", "testing", "deployment", "maintenance"]}
                                renderInput={(params) => <TextField {...params} label="Phase" size="small" />}
                                slotProps={{ popper: { style: { zIndex: 20000 } } }}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex-1 flex flex-col gap-3">
                            {/* Team */}
                            <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 'bold' }}>
                                Team
                            </Typography>
                            <TextField
                                label="Team Size"
                                variant="outlined"
                                color="secondary"
                                type="number"
                                inputProps={{ min: 1 }}
                                value={teamSize}
                                onChange={(e) => setTeamSize(e.target.value ? Number(e.target.value) : "")}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Lead Developer"
                                variant="outlined"
                                color="secondary"
                                value={leadDeveloper}
                                onChange={(e) => setLeadDeveloper(e.target.value)}
                                fullWidth
                                size="small"
                            />

                            <Divider sx={{ mt: 1 }} />

                            {/* Effort Tracking */}
                            <Typography variant="subtitle1" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Effort Tracking
                            </Typography>
                            <TextField
                                label="Estimated Hours"
                                variant="outlined"
                                color="secondary"
                                type="number"
                                inputProps={{ min: 0, step: 0.5 }}
                                value={estimatedHours}
                                onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : "")}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Actual Hours"
                                variant="outlined"
                                color="secondary"
                                type="number"
                                inputProps={{ min: 0, step: 0.5 }}
                                value={actualHours}
                                onChange={(e) => setActualHours(e.target.value ? Number(e.target.value) : "")}
                                fullWidth
                                size="small"
                            />

                            <Divider sx={{ mt: 1 }} />

                            {/* Risk & Management */}
                            <Typography variant="subtitle1" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Risk & Management
                            </Typography>
                            <TextField
                                label="Category"
                                variant="outlined"
                                color="secondary"
                                placeholder="e.g., web, mobile, desktop, api, library"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                                size="small"
                            />
                            <Autocomplete
                                value={riskLevel}
                                onChange={(_event, newValue) => setRiskLevel((newValue || "low") as any)}
                                options={["low", "medium", "high"]}
                                renderInput={(params) => <TextField {...params} label="Risk Level" size="small" />}
                                slotProps={{ popper: { style: { zIndex: 20000 } } }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        color="secondary"
                                    />
                                }
                                label="Is Active"
                            />
                        </div>
                    </div>

                    <Divider sx={{ mt: 2 }} />

                    {/* Full Width Section - Metadata */}
                    <Typography variant="subtitle1" color="secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Additional Information
                    </Typography>
                    <div>
                        <TextField
                            label="Add Tag"
                            variant="outlined"
                            color="secondary"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            fullWidth
                            size="small"
                        />
                        <Button
                            onClick={handleAddTag}
                            variant="text"
                            color="secondary"
                            size="small"
                            sx={{ mt: 0.5 }}
                        >
                            Add Tag
                        </Button>
                        {tags.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                                {tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        onDelete={() => handleDeleteTag(tag)}
                                        color="secondary"
                                        size="small"
                                    />
                                ))}
                            </Stack>
                        )}
                    </div>
                    <TextField
                        label="Notes"
                        variant="outlined"
                        color="secondary"
                        multiline
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </>
            )}

            <Divider sx={{ mt: 2 }} />

            <Button
                startIcon={<LibraryAddCheckOutlinedIcon />}
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 1 }}
            >
                Add Project
            </Button>

        </Box>
    </form>
}

export default ProjectForm;
