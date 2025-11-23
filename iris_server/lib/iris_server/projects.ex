defmodule IrisServer.Projects do
  import Ecto.Query, warn: false
  alias IrisServer.Repo
  alias IrisServer.Projects.Project

  def list_projects do
    Repo.all(Project)
  end

  def get_project!(id), do: Repo.get!(Project, id)

  def create_project(attrs \\ %{}) do
    %Project{}
    |> Project.changeset(attrs)
    |> Repo.insert()
  end
end
