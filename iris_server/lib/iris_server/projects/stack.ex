defmodule IrisServer.Projects.Stack do
  use Ecto.Schema
  import Ecto.Changeset

  schema "stacks" do
    field(:name, :string)
    field(:category, :string)
    field(:version, :string)
    field(:description, :string)

    many_to_many(:projects, IrisServer.Projects.Project, join_through: "project_stacks")

    timestamps()
  end

  def changeset(stack, attrs) do
    stack
    |> cast(attrs, [:name, :category, :version, :description])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end
end
