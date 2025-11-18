defmodule ProstagmaServer.Repo.Migrations.CreateProjects do
  use Ecto.Migration

  def change do
    create table(:projects) do
      add :name, :string, null: false
      add :description, :text
      add :status, :string, null: false
      add :stack, :string, null: false

      timestamps()
    end

    create index(:projects, [:name])
  end
end
