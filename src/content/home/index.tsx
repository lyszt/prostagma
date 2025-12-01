import { type FC } from "react";
import { useState, useEffect } from "react";
import Network, { type NetworkResponse } from "../../lib/Network.ts";
import type { Project } from "../../types";
import { type GridColDef } from "@mui/x-data-grid";
import Datagrid from "../../components/datagrid";
import { API_URL } from "../../config";
import AddProject from "./AddProject.tsx";



const Home: FC = () => {
  const baseUrl = API_URL;
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLength, setProjectsLength] = useState(0);
  const [projectRefresh, setProjectRefresh] = useState(0);

  const projectManager = new Network(baseUrl);

  useEffect(() => {
    (async () => {
      const res: NetworkResponse<{ data: Project[] }> = await projectManager.get<{ data: Project[] }>("/projects");
      if (res.ok && res.body?.data) {
        setProjects(res.body.data);
        setProjectsLength(res.body.data.length);
      } else {
        console.error("Failed to fetch projects: status", res.status, res.body);
      }
    })();
  }, [projectRefresh]);
  



  let currentPaginationModel = { page: 0, pageSize: projectsLength || 5 };
  const projectColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70, minWidth: 50 },
    { field: "name", headerName: "Project Name", width: 200, minWidth: 150, flex: 1 },
    { field: "description", headerName: "Project Description", width: 300, minWidth: 200, flex: 2 },
    { field: "status", headerName: "Project Status", width: 120, minWidth: 100 },
    {
      field: "stacks",
      headerName: "Stacks",
      width: 200,
      minWidth: 150,
      valueGetter: (_value, row) => {
        return row.stacks?.map((stack: any) => stack.name).join(", ") || "";
      }
    }
  ];


  return (
    <div>
      <div className="bg-gray-100 p-5 w-full">
        <h1 className="w-full flex justify-left items-center gap-5">
          <svg
            className="w-10"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                fill="#df046e"
                fillRule="evenodd"
                d="M0,8 C0,6.34315 1.34315,5 3,5 L13,5 C14.6569,5 16,6.34315 16,8 C16,9.65685 14.6569,11 13,11 L3,11 C1.34315,11 0,9.65685 0,8 Z M10,7 L13,7 C13.5523,7 14,7.44772 14,8 C14,8.55228 13.5523,9 13,9 L8,9 L10,7 Z"
              ></path>{" "}
            </g>
          </svg>
          Current ongoing projects
        </h1>
      </div>

    {/*  DATAGRID + PROJECT ELEMENTS*/}

    <AddProject projectManager={projectManager} projectRefresh={projectRefresh} setProjectRefresh={setProjectRefresh} />
      <Datagrid
        rows={projects}
        columns={projectColumns}
        paginationModel={currentPaginationModel}
      ></Datagrid>
    </div>
    
  );
};

export default Home;
