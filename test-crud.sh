#!/bin/bash
# test-crud.sh - Script para testar as rotinas CRUD e Observabilidade nos ambientes

HOST=${1:-"http://localhost:3000"}

echo "=== Iniciando Testes CRUD no Ambiente: $HOST ==="

echo -e "\n1. CREATE: Inserindo uma nova palavra teste..."
CREATE_RES=$(curl -s -X POST -H "Content-Type: application/json" -d '{"word": "observabilidade"}' $HOST/api/words)
echo "Resposta: $CREATE_RES"

echo -e "\n2. READ: Buscando todas as palavras..."
curl -s -X GET $HOST/api/words | head -n 1
echo "... (truncado)"

echo -e "\n3. UPDATE: Marcando a palavra 'observabilidade' como usada..."
UPDATE_RES=$(curl -s -X PUT -H "Content-Type: application/json" -d '{"used": true}' $HOST/api/words/observabilidade)
echo "Resposta: $UPDATE_RES"

echo -e "\n4. DELETE: Deletando a palavra 'observabilidade'..."
DELETE_RES=$(curl -s -X DELETE $HOST/api/words/observabilidade)
echo "Resposta: $DELETE_RES"

echo -e "\n5. OBSERVABILIDADE: Verificando se o Prometheus está lendo as métricas do Node.js..."
METRICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HOST/metrics)
if [ "$METRICS_STATUS" -eq 200 ]; then
  echo "Sucesso: O endpoint /metrics está no ar (Status 200) e pronto para o Prometheus!"
else
  echo "Falha: O endpoint /metrics retornou status $METRICS_STATUS"
fi

echo -e "\n=== Fim dos Testes ==="
