defmodule ProstagmaServer.Repo.Migrations.EnhanceProjectsTable do
  use Ecto.Migration

  def change do
    alter table(:projects) do
      # Remove old single stack field
      remove :stack

      # Project URLs
      add :repository_url, :string
      add :documentation_url, :string
      add :demo_url, :string

      # Planning & Timeline
      add :start_date, :date
      add :end_date, :date
      add :deadline, :date
      add :priority, :string, default: "medium" # low, medium, high, critical

      # Progress & Status
      add :progress, :integer, default: 0 # 0-100
      add :phase, :string, default: "planning" # planning, design, development, testing, deployment, maintenance

      # Team
      add :team_size, :integer
      add :lead_developer, :string

      # Effort Tracking
      add :estimated_hours, :decimal
      add :actual_hours, :decimal

      # Risk & Management
      add :risk_level, :string, default: "low" # low, medium, high
      add :category, :string # web, mobile, desktop, api, library, etc.
      add :is_active, :boolean, default: true

      # Additional metadata
      add :tags, {:array, :string}, default: []
      add :notes, :text
    end

    create index(:projects, [:priority])
    create index(:projects, [:phase])
    create index(:projects, [:is_active])
    create index(:projects, [:category])
  end
end
