// Script para verificar o estado da autenticação
console.log('=== Verificação de Autenticação ===');

// Simular localStorage (não disponível em Node.js)
const fs = require('fs');
const path = require('path');

// Verificar se existe algum arquivo de configuração ou dados de teste
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Configuração da API:', envContent);
}

console.log('Para verificar a autenticação, abra o console do navegador e execute:');
console.log('localStorage.getItem("token")');
console.log('localStorage.getItem("user")');
console.log('');
console.log('Se não houver token, você precisa fazer login primeiro.');