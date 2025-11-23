defmodule IrisServer.Repo.Migrations.CreateProjects do
  use Ecto.Migration

  def change do
    create table(:projects, primary_key: false) do
      add :id, :serial, primary_key: true
      # NAME EX: Extension for simulating web scraping
      add :name, :string, null: false
      # DESCRIPTION Any description concerning the project generally, an introductory desc.
      add :description, :text
      # STATUS In progress, abandoned, completed...
      add :status, :string, null: false
      add :stack, :string, null: false

      timestamps()
    end

    create index(:projects, [:name])
  end
end
