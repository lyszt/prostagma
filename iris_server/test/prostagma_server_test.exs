defmodule ProstagmaServerTest do
  use ExUnit.Case
  doctest ProstagmaServer

  test "greets the world" do
    assert ProstagmaServer.hello() == :world
  end
end
