defmodule IrisServerWeb.ProjectController do
  use IrisServerWeb, :controller
  alias IrisServer.Projects

  # GET /api/projects
  def list(conn, _params) do
    # Meant to list all created projects, whether it be running or not
    projects = Projects.list_projects()
    render(conn, :index, projects: projects)
  end

  # POST /api/projects
  def add(conn, params) do
    # This will be the controller function that adds new projects. Should probably call the repository.
    case Projects.create_project(params) do
      {:ok, project} ->
        conn
        |> put_status(:created)
        |> render(:show, project: project)

      {:error, changeset} ->
        errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)

        conn
        |> put_status(:bad_request)
        |> json(%{errors: errors})
    end
  end
end
