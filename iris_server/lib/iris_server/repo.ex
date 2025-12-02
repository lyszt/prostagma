defmodule IrisServer.Repo do
  use Ecto.Repo,
    otp_app: :iris_server,
    adapter: Ecto.Adapters.Postgres
end
