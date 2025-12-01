defmodule ProstagmaServer.Repo.Migrations.CreateProjectStacks do
  use Ecto.Migration

  def change do
    create table(:project_stacks, primary_key: false) do
      add :project_id, references(:projects, on_delete: :delete_all), null: false
      add :stack_id, references(:stacks, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:project_stacks, [:project_id, :stack_id])
    create index(:project_stacks, [:project_id])
    create index(:project_stacks, [:stack_id])
  end
end
