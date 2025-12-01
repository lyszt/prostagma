defmodule ProstagmaServer.Repo.Migrations.CreateStacks do
  use Ecto.Migration

  def change do
    create table(:stacks) do
      add :name, :string, null: false
      add :category, :string # language, framework, database, tool, platform, etc.
      add :version, :string
      add :description, :text

      timestamps()
    end

    create unique_index(:stacks, [:name])
    create index(:stacks, [:category])
  end
end
