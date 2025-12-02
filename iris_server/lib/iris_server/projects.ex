defmodule IrisServer.Projects do
  import Ecto.Query, warn: false
  alias IrisServer.Repo
  alias IrisServer.Projects.{Project, Stack}

  # Projects

  def list_projects do
    Project
    |> preload(:stacks)
    |> Repo.all()
  end

  def get_project!(id) do
    Project
    |> preload(:stacks)
    |> Repo.get!(id)
  end

  def create_project(attrs \\ %{}) do
    stack_ids = Map.get(attrs, "stack_ids", [])

    %Project{}
    |> Project.changeset_with_stacks(attrs, stack_ids)
    |> Repo.insert()
  end

  def update_project(%Project{} = project, attrs) do
    stack_ids = Map.get(attrs, "stack_ids", [])

    project
    |> Project.changeset_with_stacks(attrs, stack_ids)
    |> Repo.update()
  end

  def delete_project(%Project{} = project) do
    Repo.delete(project)
  end

  # Stacks

  def list_stacks do
    Repo.all(Stack)
  end

  def get_stack!(id), do: Repo.get!(Stack, id)

  def create_stack(attrs \\ %{}) do
    %Stack{}
    |> Stack.changeset(attrs)
    |> Repo.insert()
  end

  def update_stack(%Stack{} = stack, attrs) do
    stack
    |> Stack.changeset(attrs)
    |> Repo.update()
  end

  def delete_stack(%Stack{} = stack) do
    Repo.delete(stack)
  end

  def find_or_create_stack(name) when is_binary(name) do
    case Repo.get_by(Stack, name: name) do
      nil ->
        create_stack(%{name: name})

      stack ->
        {:ok, stack}
    end
  end
end
