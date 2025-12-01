import { type FC, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useState, useRef } from "react";
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
import Draggable from 'react-draggable';
import * as languages from "linguist-languages";
import { addProject } from "./projectServices";
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';

interface AddProjectProps {
    projectManager: Network;
    projectRefresh?: number;
    setProjectRefresh?: Dispatch<SetStateAction<number>>;
}

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
    const [showAllFields, setShowAllFields] = useState(false);

    const handleToggleExpand = () => {
        if (setIsExpanded) {
            setIsExpanded(!isExpanded);
            setShowAllFields(!isExpanded);
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

        // TODO: We need to create/find stacks first and get their IDs
        // For now, we'll just submit without stack_ids
        // This will need to be enhanced to work with the many-to-many relationship

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
            // Note: stacks are stored in the array but not yet integrated with backend
            // This will need stack_ids once we implement stack management
        };

        const status = await addProject(projectManager, projectData);
        if (status >= 200 && status < 300) {
            if(setProjectRefresh) setProjectRefresh((prev) => prev + 1);
            onSubmit?.();
        } else {
            console.warn("Failure submitting the project form. Status:", status);
        }
    }

    return <form onSubmit={prepareProject} className="w-full bg-white z-9999 flex flex-col shadow-2xl rounded-lg h-full">
        <div className={`bg-gray-200 p-4 rounded-t-lg flex items-center justify-between sticky top-0 z-50 flex-shrink-0 ${!isExpanded ? 'handle cursor-move' : ''}`}>
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="crimson" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Add Project</h2>
            </div>
            <button
                type="button"
                onClick={onCancel}
                className="p-1 hover:bg-gray-300 rounded transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="crimson" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                {...getTagProps({ index })}
                                key={index}
                                label={option}
                                color="secondary"
                                size="small"
                            />
                        ))
                    }
                    slotProps={{ popper: { style: { zIndex: 20000 } } }}
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
            {showAllFields && (
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
                startIcon={<LibraryAddCheckOutlinedIcon/>}
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mt: 1 }}
            >
                Add Project
            </Button>
        </Box>
    </form>
}

const AddProject: FC<AddProjectProps> = ({ projectManager, setProjectRefresh }) => {
    const [projectData] = useState<ProjectInput | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const nodeRef = useRef(null);

    const handleFormSubmit = () => {
        setShowForm(false);
        setIsExpanded(false);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setIsExpanded(false);
    };

    const getModalStyle = () => {
        if (isExpanded) {
            return {
                position: 'fixed' as const,
                zIndex: 9999,
                width: '100vw',
                height: '100vh',
                left: 0,
                top: 0,
                transform: 'none'
            };
        }
        return {
            position: 'fixed' as const,
            zIndex: 9999,
            width: '500px',
            left: '50%',
            top: '10%',
            transform: 'translateX(-50%)',
            maxHeight: '80vh'
        };
    };

    return (
        <div>
            {showForm && (
                <>
                    {isExpanded ? (
                        <div style={getModalStyle()}>
                            <ProjectForm
                                projectManager={projectManager}
                                initialData={projectData}
                                onSubmit={handleFormSubmit}
                                onCancel={handleFormCancel}
                                setProjectRefresh={setProjectRefresh}
                                isExpanded={isExpanded}
                                setIsExpanded={setIsExpanded}
                            />
                        </div>
                    ) : (
                        <Draggable handle=".handle" nodeRef={nodeRef}>
                            <div ref={nodeRef} style={getModalStyle()}>
                                <ProjectForm
                                    projectManager={projectManager}
                                    initialData={projectData}
                                    onSubmit={handleFormSubmit}
                                    onCancel={handleFormCancel}
                                    setProjectRefresh={setProjectRefresh}
                                    isExpanded={isExpanded}
                                    setIsExpanded={setIsExpanded}
                                />
                            </div>
                        </Draggable>
                    )}
                </>
            )}
            <button onClick={() => setShowForm(true)} className="flex flex-row gap-2 m-5 p-3 transition duration-100 hover:bg-gray-100 rounded active:bg-gray-200">
                <svg className="w-[1.5vw]"
                    viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="crimson"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>plus-circle</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Icon-Set-Filled" transform="translate(-466.000000, -1089.000000)" fill="crimson"> <path d="M488,1106 L483,1106 L483,1111 C483,1111.55 482.553,1112 482,1112 C481.447,1112 481,1111.55 481,1111 L481,1106 L476,1106 C475.447,1106 475,1105.55 475,1105 C475,1104.45 475.447,1104 476,1104 L481,1104 L481,1099 C481,1098.45 481.447,1098 482,1098 C482.553,1098 483,1098.45 483,1099 L483,1104 L488,1104 C488.553,1104 489,1104.45 489,1105 C489,1105.55 488.553,1106 488,1106 L488,1106 Z M482,1089 C473.163,1089 466,1096.16 466,1105 C466,1113.84 473.163,1121 482,1121 C490.837,1121 498,1113.84 498,1105 C498,1096.16 490.837,1089 482,1089 L482,1089 Z" id="plus-circle"> </path> </g> </g> </g></svg>
                Add project
            </button>
        </div>
    );
}

export default AddProject;
