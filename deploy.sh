#!/bin/bash

echo "🚀 Gerando seu link direto..."
echo ""

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build para web
echo "🔨 Criando versão web..."
npm run web:build 2>/dev/null || npx expo export:web --output-dir dist 2>/dev/null || {
    echo "❌ Erro ao criar build web"
    echo ""
    echo "💡 Use uma destas alternativas:"
    echo "   1. Abra LINK_DIRETO.md e siga as instruções"
    echo "   2. Execute: npm run web (para testar localmente)"
    exit 1
}

# Deploy com Surge (não precisa conta)
echo "☁️  Fazendo deploy..."
npx surge ./dist fitness-tracker-$(date +%s).surge.sh --token anonymous 2>/dev/null || {
    echo ""
    echo "📝 Build web criado em: ./dist"
    echo ""
    echo "Para publicar, escolha uma opção:"
    echo "   1. Vercel: npx vercel --cwd dist"
    echo "   2. Netlify: npx netlify deploy --dir=dist --prod"
    echo "   3. Surge: npx surge dist"
    echo ""
    echo "Ou abra LINK_DIRETO.md para instruções detalhadas!"
}
