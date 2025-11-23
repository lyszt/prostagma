defmodule IrisServerWeb.PageController do
  use IrisServerWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
