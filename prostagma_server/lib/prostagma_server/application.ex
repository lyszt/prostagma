defmodule ProstagmaServer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ProstagmaServerWeb.Telemetry,
      ProstagmaServer.Repo,
      {DNSCluster, query: Application.get_env(:prostagma_server, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: ProstagmaServer.PubSub},
      # Start a worker by calling: ProstagmaServer.Worker.start_link(arg)
      # {ProstagmaServer.Worker, arg},
      # Start to serve requests, typically the last entry
      ProstagmaServerWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ProstagmaServer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ProstagmaServerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
