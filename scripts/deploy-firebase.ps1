param(
  [string]$ProjectId = "hartman-071193"
)

firebase use $ProjectId
firebase deploy --only hosting
