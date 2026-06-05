param(
    [string]$Version,
    [ValidateSet("patch", "minor", "major")]
    [string]$Bump = "patch",
    [switch]$SkipPackage
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$packageJsonPath = Join-Path $repoRoot "package.json"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path -LiteralPath $packageJsonPath)) {
    throw "Cannot find package.json at $packageJsonPath"
}

$packageJsonRaw = [System.IO.File]::ReadAllText($packageJsonPath)
$packageJson = $packageJsonRaw | ConvertFrom-Json

if (-not $packageJson.version) {
    throw "The root package.json does not contain a version field."
}

function Get-NextVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CurrentVersion,
        [Parameter(Mandatory = $true)]
        [string]$Level
    )

    $parts = $CurrentVersion.Split(".")
    if ($parts.Length -ne 3) {
        throw "Current version '$CurrentVersion' is not in semver 'x.y.z' format."
    }

    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]

    switch ($Level) {
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "patch" {
            $patch++
        }
    }

    return "$major.$minor.$patch"
}

$currentVersion = [string]$packageJson.version
$targetVersion = if ($PSBoundParameters.ContainsKey("Version") -and $Version) {
    $Version
}
else {
    Get-NextVersion -CurrentVersion $currentVersion -Level $Bump
}

if ($targetVersion -notmatch '^\d+\.\d+\.\d+$') {
    throw "Target version '$targetVersion' is not in semver 'x.y.z' format."
}

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$packageJsonBytes = [System.IO.File]::ReadAllBytes($packageJsonPath)
$hasUtf8Bom = $packageJsonBytes.Length -ge 3 -and
    $packageJsonBytes[0] -eq 239 -and
    $packageJsonBytes[1] -eq 187 -and
    $packageJsonBytes[2] -eq 191

if ($targetVersion -ne $currentVersion) {
    $updatedJson = $packageJsonRaw -replace ('"version"\s*:\s*"' + [regex]::Escape($currentVersion) + '"'), ('"version": "' + $targetVersion + '"')
    if ($updatedJson -eq $packageJsonRaw) {
        throw "Failed to update the version field in package.json."
    }

    Write-Utf8NoBom -Path $packageJsonPath -Content $updatedJson
    Write-Host "Updated version: $currentVersion -> $targetVersion"
}
else {
    Write-Host "Version unchanged: $currentVersion"
    if ($hasUtf8Bom) {
        Write-Utf8NoBom -Path $packageJsonPath -Content $packageJsonRaw
        Write-Host "Removed UTF-8 BOM from package.json"
    }
}

if ($SkipPackage) {
    Write-Host "SkipPackage specified, not running vsce package."
    exit 0
}

Push-Location $repoRoot
try {
    Write-Host "Running: npx @vscode/vsce package"
    & npx @vscode/vsce package
    if ($LASTEXITCODE -ne 0) {
        throw "vsce package failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}
