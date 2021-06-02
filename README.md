# Dropbox Clone

Site de armazenamento e gerenciamento de arquivos (Clone do Dropbox) escrito em Node / Express. 

Neste aplicativo da web é possível adicionar, renomear e excluir arquivos, bem como organizá-los em pastas.

## Começo rápido 

Para colocar este projeto em execução localmente em seu computador:

1. Configure um ambiente de desenvolvimento [Nodejs](https://developer.mozilla.org/pt-BR/docs/Learn/Server-side/Express_Nodejs/development_environment).
2. Esta aplicação usa o Realtime Database como banco de dados, então será necessário que você crie seu próprio projeto no Firebase, e inicialize o Realtime Database. [Acesse o site do Firebase para mais informações](https://firebase.google.com/docs/database).
3. Após criá-la, [inicialize o SDK e configure a sua variável de ambiente](https://firebase.google.com/docs/admin/setup?authuser=0#initialize-sdk).

Para executar:

5. Defina a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS como o caminho do arquivo JSON que contém a chave da conta de serviço. O comando que deverá ser digitado no terminal será parecido com este: 
   ```
   export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
   ```
6. Em seguida, cole o seguinte comando:
   ```
   DEBUG=dropbox-clone:* npm start   #Para Linux
   ```
8. Abra um navegador em  http://localhost:3000/ para abrir o site da biblioteca.
