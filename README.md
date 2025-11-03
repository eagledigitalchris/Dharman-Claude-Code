# Aplicativo de Fitness - React Native/Expo

Aplicativo completo de rastreamento de fitness com interface em Português Brasileiro, incluindo monitoramento de hábitos diários, progresso corporal e análise de composição com check-ins fotográficos.

## Características

### Telas Principais

1. **Home (Hoje)**
   - Visualização de calorias e macros consumidos
   - Rastreamento de consumo de água (com incrementos rápidos de 250ml/500ml)
   - Contador de passos
   - Interface com cartões gradiente

2. **Progresso**
   - Sistema de check-ins fotográficos
   - Comparação visual antes/depois
   - Gráficos de evolução de peso
   - Métricas de gordura corporal e cintura
   - Cálculo automático de períodos (em meses)

3. **Detalhe de Peso**
   - Gráfico de linha com histórico
   - Lista de entradas com swipe-to-delete
   - Modal para adicionar novos pesos
   - Visualização de progresso com delta e meta

## Tecnologias

- **Frontend**: React Native + Expo
- **Navegação**: React Navigation (Bottom Tabs + Stack)
- **Gráficos**: react-native-chart-kit
- **Backend**: Firebase (Firestore + Storage) - configurável
- **State**: React Hooks + AsyncStorage
- **Tipagem**: TypeScript
- **Ícones**: @expo/vector-icons

## Instalação

```bash
# Instalar dependências
npm install

# Rodar no iOS
npm run ios

# Rodar no Android
npm run android

# Rodar na Web
npm run web
```

## Configuração do Firebase

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore e Storage
3. Copiar credenciais para `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: 'SUA_API_KEY',
  authDomain: 'SEU_AUTH_DOMAIN',
  projectId: 'SEU_PROJECT_ID',
  storageBucket: 'SEU_STORAGE_BUCKET',
  messagingSenderId: 'SEU_MESSAGING_SENDER_ID',
  appId: 'SEU_APP_ID',
};
```

## Estrutura do Projeto

```
src/
├── components/
│   ├── cards/           # FoodCard, ActivityCard, MetricCard, CheckinCard
│   ├── charts/          # Componentes de gráficos
│   └── common/          # Button, Input, ProgressBar, FAB, FadeInView
├── screens/
│   ├── home/            # HomeScreen
│   ├── progress/        # ProgressScreen, WeightDetailScreen
│   └── modals/          # WaterLogModal, StepsInputModal
├── navigation/
│   ├── RootNavigator.tsx
│   └── BottomTabNavigator.tsx
├── services/
│   ├── firebase.ts      # Configuração Firebase
│   ├── storage.ts       # AsyncStorage helper
│   └── calculations.ts  # Funções de cálculo (peso, gordura corporal)
├── hooks/
│   ├── useWeightData.ts
│   ├── useWaterLogs.ts
│   └── useMeasures.ts
├── utils/
│   ├── formatters.ts    # Formatação pt-BR (números, datas)
│   └── dateHelpers.ts   # Manipulação de datas
├── constants/
│   ├── colors.ts        # Sistema de cores
│   ├── typography.ts    # Estilos de tipografia
│   └── translations.ts  # Traduções pt-BR
└── types/
    └── index.ts         # TypeScript types
```

## Localização Portuguesa

Todo o aplicativo utiliza formatação brasileira:

- **Números**: vírgula para decimal (82,6 kg)
- **Datas**: formato DD MMM. AAAA (24 Out. 2025)
- **Períodos**: "em 7 meses", "Hoje"
- **Interface**: 100% em português

## Esquema do Banco de Dados

### Coleções Firestore

**users**
```typescript
{
  id: string;
  name: string;
  height_cm: number;
  goal_weight_kg: number;
  goal_water_ml: number;
  goal_steps: number;
  goal_calories: number;
}
```

**weights**
```typescript
{
  id: string;
  user_id: string;
  date: timestamp;
  weight_kg: number;
}
```

**hydration_logs**
```typescript
{
  id: string;
  user_id: string;
  date: timestamp;
  ml: number;
}
```

**checkins**
```typescript
{
  id: string;
  user_id: string;
  week_ref: string; // "YYYY-WW"
  photos: { front: string, side: string, back: string };
  weight_kg: number;
  waist_cm: number;
  body_fat_pct: number;
}
```

**measures**
```typescript
{
  id: string;
  user_id: string;
  date: timestamp;
  waist_cm: number;
  body_fat_pct: number;
}
```

## Próximos Passos (Implementação Futura)

### Fase 2
- [ ] Captura de fotos para check-ins (Camera API)
- [ ] Visualização de comparação lado-a-lado
- [ ] Cálculo automático de % de gordura corporal (método US Navy)
- [ ] Edição de entradas existentes

### Fase 3
- [ ] Templates de refeições
- [ ] Rastreamento de macros
- [ ] Configuração de divisão de treino
- [ ] Checklist de suplementos

### Fase 4
- [ ] Notificações push (lembretes de check-in)
- [ ] Integração Apple Health / Google Fit
- [ ] Backup/restore de dados
- [ ] Exportação de progresso (PDF/imagens)

## Cálculos Implementados

### Progresso de Peso
```typescript
const progress = {
  lost: initialWeight - currentWeight,
  total: initialWeight - goalWeight,
  percentage: (lost / total) * 100,
  remaining: currentWeight - goalWeight,
};
```

### Gordura Corporal (US Navy Method)
- **Homens**: Baseado em cintura, pescoço e altura
- **Mulheres**: Baseado em cintura, quadril, pescoço e altura

## Suporte

Para problemas ou sugestões, abra uma issue no repositório.

## Licença

MIT
