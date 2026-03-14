#!/bin/bash
# seed.sh - Popula o banco de dados com palavras via endpoint da API
# Aguarda a API estar disponível e então dispara a população de palavras

HOST=${1:-"http://localhost:3000"}
MAX_RETRIES=15
RETRY_INTERVAL=5

echo "============================================="
echo " 🌱 FORCA API - SEED DO BANCO DE DADOS"
echo "============================================="
echo " API: $HOST"
echo "============================================="
echo ""

# Aguarda a API subir
echo "⏳ Aguardando a API ficar disponível..."
for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "$HOST/metrics" > /dev/null 2>&1; then
        echo "✅ API disponível!"
        break
    fi
    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ Timeout: API não respondeu em $((MAX_RETRIES * RETRY_INTERVAL))s"
        echo "   Verifique se os containers estão rodando: docker-compose ps"
        exit 1
    fi
    echo "   Tentativa $i/$MAX_RETRIES — aguardando ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

echo ""
echo "🌱 Populando banco de dados com palavras..."
RESPONSE=$(curl -sf -X POST "$HOST/api/word" -H "Content-Type: application/json" 2>&1)
STATUS=$?

if [ $STATUS -eq 0 ]; then
    echo "✅ Banco populado com sucesso!"
    echo "   Resposta: $RESPONSE"
else
    echo "⚠️  Erro ao popular via API (status: $STATUS)"
    echo "   Tente popular manualmente via SQL:"
    echo "   docker exec -i forca-db mysql -uroot -proot forca < seed.sql"
fi

echo ""
echo "============================================="
echo " ✅ SEED CONCLUÍDO!"
echo "   Acesse o jogo em: http://localhost:8080"
echo "============================================="
