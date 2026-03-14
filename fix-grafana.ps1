# fix-grafana.ps1 - Corrige os paineis do Grafana via API REST
[System.Text.Encoding]::UTF8 | Out-Null

$BASE_URL = "http://localhost:3005"
$CREDS = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
$HEADERS = @{
    "Content-Type" = "application/json"
    "Authorization" = "Basic $CREDS"
}

Write-Host "Buscando dashboard existente..." 

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/dashboards/uid/ad9lg8n" -Headers $HEADERS -Method GET
} catch {
    Write-Host "Erro: $_"
    exit 1
}

$dashboard = $response.dashboard
$folderId = $response.meta.folderId

Write-Host "Dashboard: $($dashboard.title)"
Write-Host "Paineis: $($dashboard.panels.Count)"

foreach ($panel in $dashboard.panels) {
    Write-Host "Panel $($panel.id): $($panel.title)"
    if ($panel.targets) {
        foreach ($target in $panel.targets) {
            Write-Host "  Query: $($target.expr)"
            if ($target.expr -eq "nodejs_heap_used_bytes") {
                $target.expr = "nodejs_heap_size_used_bytes"
                Write-Host "  -> FIXED: nodejs_heap_size_used_bytes"
            }
        }
    }
}

$body = @{
    dashboard = $dashboard
    folderId = $folderId
    overwrite = $true
    message = "Fix heap memory query"
} | ConvertTo-Json -Depth 20 -Compress

Write-Host "Salvando..."
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/api/dashboards/db" -Headers $HEADERS -Method POST -Body $body
    Write-Host "OK! URL: $BASE_URL$($result.url)"
} catch {
    Write-Host "Erro ao salvar: $_"
}
