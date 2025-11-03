# 📱 Como Usar o Aplicativo de Fitness

## Opção 1: Testar no Celular com Expo Go (RECOMENDADO)

### Passo a Passo:

1. **Baixe o Expo Go no seu celular:**
   - **iPhone/iPad:** [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
   - **Android:** [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **No seu computador, execute:**
   ```bash
   cd Dharman-Claude-Code
   npx expo start --tunnel
   ```

3. **Escaneie o QR Code:**
   - **iPhone:** Abra a câmera e aponte para o QR code que apareceu no terminal
   - **Android:** Abra o Expo Go e toque em "Scan QR code"

4. **Pronto!** O app vai carregar no seu celular em alguns segundos 🎉

---

## Opção 2: Rodar no Navegador (Versão Web)

```bash
cd Dharman-Claude-Code
npm run web
```

Depois abra: http://localhost:8081

---

## Opção 3: Deploy Permanente na Vercel (Link Público)

### Configuração Rápida:

1. **Crie conta grátis na Vercel:**
   - Acesse: https://vercel.com/signup
   - Conecte sua conta GitHub

2. **Instale Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

3. **Faça o deploy:**
   ```bash
   cd Dharman-Claude-Code
   vercel
   ```

4. **Siga as instruções** e você receberá um link público tipo:
   ```
   https://fitness-tracker-ptbr.vercel.app
   ```

---

## 🎯 Recomendação

**Para melhor experiência:** Use a Opção 1 (Expo Go no celular)

O app foi feito para mobile e funciona melhor com gestos touch, animações nativas, etc.

---

## ❓ Problemas Comuns

**"Expo Go não conecta"**
- Verifique se o celular e computador estão na mesma rede WiFi
- Use a opção `--tunnel` se estiver em redes diferentes

**"Erro ao rodar npx expo start"**
- Execute: `npm install` primeiro
- Verifique se tem Node.js instalado: `node --version`

**"Quero link permanente agora"**
- A forma mais rápida é criar conta na Vercel (gratuita)
- Você pode me dar acesso à conta e eu faço o deploy pra você

---

## 📞 Precisa de Ajuda?

Me chame de volta e eu te ajudo! 🚀
