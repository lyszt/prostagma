defmodule IrisServer.Projects.Project do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  @primary_key {:id, :id, autogenerate: true}

  schema "projects" do
    # Basic info
    field(:name, :string)
    field(:description, :string)
    field(:status, :string)

    # URLs
    field(:repository_url, :string)
    field(:documentation_url, :string)
    field(:demo_url, :string)

    # Planning & Timeline
    field(:start_date, :date)
    field(:end_date, :date)
    field(:deadline, :date)
    field(:priority, :string, default: "medium")

    # Progress & Status
    field(:progress, :integer, default: 0)
    field(:phase, :string, default: "planning")

    # Team
    field(:team_size, :integer)
    field(:lead_developer, :string)

    # Effort Tracking
    field(:estimated_hours, :decimal)
    field(:actual_hours, :decimal)

    # Risk & Management
    field(:risk_level, :string, default: "low")
    field(:category, :string)
    field(:is_active, :boolean, default: true)

    # Additional metadata
    field(:tags, {:array, :string}, default: [])
    field(:notes, :string)

    # Associations
    many_to_many(:stacks, IrisServer.Projects.Stack,
      join_through: "project_stacks",
      on_replace: :delete
    )

    timestamps()
  end

  def changeset(project, attrs) do
    project
    |> cast(attrs, [
      :name,
      :description,
      :status,
      :repository_url,
      :documentation_url,
      :demo_url,
      :start_date,
      :end_date,
      :deadline,
      :priority,
      :progress,
      :phase,
      :team_size,
      :lead_developer,
      :estimated_hours,
      :actual_hours,
      :risk_level,
      :category,
      :is_active,
      :tags,
      :notes
    ])
    |> validate_required([:name, :status])
    |> validate_inclusion(:priority, ["low", "medium", "high", "critical"])
    |> validate_inclusion(:phase, [
      "planning",
      "design",
      "development",
      "testing",
      "deployment",
      "maintenance"
    ])
    |> validate_inclusion(:risk_level, ["low", "medium", "high"])
    |> validate_number(:progress, greater_than_or_equal_to: 0, less_than_or_equal_to: 100)
    |> validate_number(:team_size, greater_than: 0)
  end

  def changeset_with_stacks(project, attrs, stack_ids) when is_list(stack_ids) do
    project
    |> changeset(attrs)
    |> put_assoc(:stacks, IrisServer.Repo.all(from s in IrisServer.Projects.Stack, where: s.id in ^stack_ids))
  end

  def changeset_with_stacks(project, attrs, _), do: changeset(project, attrs)
end
