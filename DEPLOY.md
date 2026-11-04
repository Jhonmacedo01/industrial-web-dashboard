# Publicação no Render

Este projeto é um site estático. O Blueprint `render.yaml` publica a raiz, sem dependências ou etapa de compilação.

## Criar o repositório

1. Extraia o ZIP e abra a pasta `meu-projeto` (a pasta que contém `render.yaml` e `index.html`).
2. Crie um repositório vazio no GitHub ou GitLab.
3. No terminal, nessa pasta, execute:

```sh
git init -b main
git add .
git commit -m "Preparar site para deploy"
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Troque a URL de exemplo do remoto pela URL real do repositório.

## Publicar

No Render, selecione **New → Blueprint**, conecte o repositório e confirme a criação do serviço `repasse-de-turno`. O Render lê o `render.yaml`; o diretório publicado é `.` e não há etapa de build.

## Aplicar o domínio e contato

Depois que o Render mostrar o endereço final do serviço, abra o PowerShell nesta pasta e execute:

```powershell
.\definir-dominio.ps1 -Url "https://SEU-SERVICO.onrender.com" -EmailResponsavel "responsavel@exemplo.com"
```

Use o endereço exato exibido pelo Render e um e-mail que possa ser publicado na página Sobre. Depois, faça commit e push das alterações.

## Conferir

Abra o site publicado e confira as páginas, o registro de uma ocorrência, a cópia do repasse e o link para WhatsApp. Os dados ficam somente no armazenamento local do navegador; não há banco de dados ou sincronização entre dispositivos.
