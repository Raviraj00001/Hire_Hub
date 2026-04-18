$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDirectory

function Test-Command {
    param (
        [string]$CommandName
    )

    return $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Get-PortableMaven {
    $toolsDirectory = Join-Path $scriptDirectory ".tools"
    $mavenVersion = "3.9.9"
    $mavenFolderName = "apache-maven-$mavenVersion"
    $mavenHome = Join-Path $toolsDirectory $mavenFolderName
    $mavenExecutable = Join-Path $mavenHome "bin\mvn.cmd"

    if (Test-Path $mavenExecutable) {
        return $mavenExecutable
    }

    $downloadDirectory = Join-Path $toolsDirectory "downloads"
    $zipPath = Join-Path $downloadDirectory "$mavenFolderName-bin.zip"
    $downloadUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/$mavenFolderName-bin.zip"

    New-Item -ItemType Directory -Force -Path $toolsDirectory | Out-Null
    New-Item -ItemType Directory -Force -Path $downloadDirectory | Out-Null

    Write-Host "Downloading Maven $mavenVersion..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath

    Write-Host "Extracting Maven..."
    Expand-Archive -Path $zipPath -DestinationPath $toolsDirectory -Force

    if (-not (Test-Path $mavenExecutable)) {
        throw "Maven download completed, but mvn.cmd was not found."
    }

    return $mavenExecutable
}

if (-not (Test-Command "java")) {
    throw "Java is not installed or not available in PATH."
}

Write-Host "Java detected."

if (Test-Command "mvn") {
    $mavenCommand = "mvn"
    Write-Host "Using installed Maven from PATH."
} else {
    Write-Host "Maven is not installed globally. Using a portable Maven copy for this project."
    $mavenCommand = Get-PortableMaven
}

Write-Host "Starting HireHub backend on http://localhost:8080"
& $mavenCommand spring-boot:run
