workflow "Compile & Lint" {
  on = "push"
  resolves = ["compile", "lint"]
}

action "install" {
  uses = "actions/npm@v2.0.0"
  args = "install"
  runs = "npm"
}

action "compile" {
  uses = "actions/npm@v2.0.0"
  needs = ["install"]
  runs = "npm"
  args = "run compile"
}

action "lint" {
  uses = "actions/npm@v2.0.0"
  needs = ["install"]
  runs = "npm"
  args = "run lint"
}
