# Dropbox Clone

Site de armazenamento e gerenciamento de arquivos (Clone do Dropbox) escrito em Node / Express. 

Neste aplicativo da web é possível adicionar, renomear e excluir arquivos, bem como organizá-los em pastas.

Para executar esta aplicação localmente, é necessário 

Ao criá-la, [inicialize o SDK e configure a sua variável de ambiente](https://firebase.google.com/docs/admin/setup?authuser=0#initialize-sdk)

## Começo rápido 

Para colocar este projeto em execução localmente em seu computador:

1. Configure um ambiente de desenvolvimento [Nodejs](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/development_environment).
2. Esta aplicação usa o Realtime Database como banco de dados, então será necessário que você crie seu próprio projeto no Firebase, e inicialize o Realtime Database. [Acesse o site do Firebase para mais informações](https://firebase.google.com/docs/database).
3. Após criá-la, [inicialize o SDK e configure a sua variável de ambiente](https://firebase.google.com/docs/admin/setup?authuser=0#initialize-sdk).
4. Cole os seguintes comandos na raíz do seu clone deste repositório
   ```
   npm install
   DEBUG=dropbox-clone:* npm start   #Para Linux
   ```
1. Abra um navegador em  http://localhost:3000/ para abrir o site da biblioteca.