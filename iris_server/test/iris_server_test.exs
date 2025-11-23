defmodule IrisServerTest do
  use ExUnit.Case
  doctest IrisServer

  test "greets the world" do
    assert IrisServer.hello() == :world
  end
end
