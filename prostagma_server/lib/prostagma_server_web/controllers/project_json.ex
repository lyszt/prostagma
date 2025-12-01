defmodule IrisServerWeb.ProjectJSON do
  @moduledoc """
  Renders project data in JSON format.
  """

  @doc """
  Renders a list of projects.
  """
  def index(%{projects: projects}) do
    %{data: for(project <- projects, do: data(project))}
  end

  @doc """
  Renders a single project.
  """
  def show(%{project: project}) do
    %{data: data(project)}
  end

  defp data(project) do
    %{
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      repository_url: project.repository_url,
      documentation_url: project.documentation_url,
      demo_url: project.demo_url,
      start_date: project.start_date,
      end_date: project.end_date,
      deadline: project.deadline,
      priority: project.priority,
      progress: project.progress,
      phase: project.phase,
      team_size: project.team_size,
      lead_developer: project.lead_developer,
      estimated_hours: project.estimated_hours,
      actual_hours: project.actual_hours,
      risk_level: project.risk_level,
      category: project.category,
      is_active: project.is_active,
      tags: project.tags,
      notes: project.notes,
      stacks: render_stacks(project),
      inserted_at: project.inserted_at,
      updated_at: project.updated_at
    }
  end

  defp render_stacks(%{stacks: %Ecto.Association.NotLoaded{}}), do: []
  defp render_stacks(%{stacks: stacks}) when is_list(stacks) do
    Enum.map(stacks, fn stack ->
      %{
        id: stack.id,
        name: stack.name,
        category: stack.category,
        version: stack.version,
        description: stack.description
      }
    end)
  end
  defp render_stacks(_), do: []
end
