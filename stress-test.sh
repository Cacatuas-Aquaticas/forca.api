#!/bin/bash
# stress-test.sh - Script de Stress-Test para demonstrar a Observabilidade no Grafana
# Dispara múltiplas requisições paralelas contra a API para gerar carga visível

HOST=${1:-"http://localhost:3000"}
TOTAL_REQUESTS=${2:-1000}
PARALLELISM=${3:-20}

echo "============================================="
echo " 🔥 FORCA API - STRESS TEST (Caos Engine)"
echo "============================================="
echo " Alvo        : $HOST"
echo " Requisições : $TOTAL_REQUESTS"
echo " Paralelas   : $PARALLELISM por lote"
echo "============================================="
echo ""

# Verifica se a URL está acessível antes de começar
echo "⏳ Verificando conexão com o servidor..."
if ! curl -sf "$HOST/metrics" > /dev/null; then
    echo "❌ Servidor não acessível em $HOST"
    echo "   Certifique-se que o docker-compose está rodando: docker-compose up -d"
    exit 1
fi
echo "✅ Servidor acessível!"
echo ""

# Endpoints da API que serão testados
ENDPOINTS=(
    "/api/words"
    "/api/word"
    "/api/game/$(date +%Y-%m-%d)"
    "/metrics"
)

echo "🚀 Iniciando stress-test com $TOTAL_REQUESTS requisições..."
echo ""

START_TIME=$(date +%s)
COMPLETED=0

# Dispara requisições em lotes paralelos
for i in $(seq 1 $TOTAL_REQUESTS); do
    # Escolhe um endpoint aleatório
    EP=${ENDPOINTS[$((RANDOM % ${#ENDPOINTS[@]}))]}
    curl -sf "$HOST$EP" > /dev/null 2>&1 &

    # A cada PARALLELISM requisições, espera os processos terminarem (controla sobrecarga)
    if (( i % PARALLELISM == 0 )); then
        wait
        COMPLETED=$i
        PERCENTAGE=$((COMPLETED * 100 / TOTAL_REQUESTS))
        FILLED=$((PERCENTAGE / 5))
        BAR=$(printf "%-20s" "$(head -c $FILLED /dev/zero | tr '\0' '█')" | tr ' ' '░')
        echo -ne "\r  Progresso: [${BAR}] ${PERCENTAGE}% (${COMPLETED}/${TOTAL_REQUESTS})"
    fi
done

# Espera todos os últimos processos em background
wait

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo ""
echo "============================================="
echo "  ✅ STRESS TEST CONCLUÍDO!"
echo "============================================="
echo "  Total de requisições : $TOTAL_REQUESTS"
echo "  Tempo total          : ${ELAPSED}s"
echo "  Média                : $(echo "scale=1; $TOTAL_REQUESTS / $ELAPSED" | bc 2>/dev/null || echo "~$(($TOTAL_REQUESTS / ($ELAPSED + 1)))") req/s"
echo ""
echo "  📊 Abra o Grafana agora para ver os gráficos!"
echo "     http://localhost:3005"
echo ""
echo "  Adicione o Prometheus como Data Source:"
echo "     URL: http://prometheus:9090"
echo ""
echo "  Métricas úteis para os painéis:"
echo "     - http_request_duration_seconds (latência)"
echo "     - process_cpu_seconds_total (CPU)"
echo "     - nodejs_heap_used_bytes (memória Heap)"
echo "     - nodejs_active_handles_total (conexões ativas)"
echo "============================================="
