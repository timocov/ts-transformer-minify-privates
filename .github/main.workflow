workflow "Compile & Lint" {
  on = "push"
  resolves = ["compile", "lint"]
}

action "install" {
  uses = "actions/npm@v2.0.0"
  args = "install"
  runs = "run"
}

action "compile" {
  uses = "actions/npm@v2.0.0"
  needs = ["install"]
  runs = "run"
  args = "compile"
}

action "lint" {
  uses = "actions/npm@v2.0.0"
  needs = ["install"]
  runs = "run"
  args = "lint"
}
