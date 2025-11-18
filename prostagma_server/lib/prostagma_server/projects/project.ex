defmodule ProstagmaServer.Projects.Project do
  use Ecto.Schema
  import Ecto.Changeset

  schema "projects" do
    field(:name, :string)
    field(:description, :string)
    field(:status, :string)
    field(:stack, :string)
    timestamps()
  end

  def changeset(project, attrs) do
    project
    |> cast(attrs, [
      :name,
      :description,
      :status,
      :stack
    ])
    |> validate_required([:name, :status])
  end
end
