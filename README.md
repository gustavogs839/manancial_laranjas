# Manancial Laranjas — Mini sistema de controle de vendas

Arquivos principais:

- `index.html` — interface do usuário (formulário, relatório)
- `styles.css` — estilos e responsividade
- `app.js` — lógica: armazenamento em `localStorage`, geração de relatório, exportar PDF e impressão de recibo (formato para Elgin i9)

Como usar:

1. Abra `index.html` no navegador.
2. Preencha o formulário com tipo (entrada/saída), método (dinheiro, débito, crédito, PIX), valor e descrição.
3. Clique em `Adicionar` para gravar. Os dados ficam no `localStorage` do navegador.
4. Use `Exportar PDF` para baixar o relatório em PDF.
5. Use `Imprimir (Elgin i9)` para abrir uma janela com layout de recibo otimizado para impressão térmica (ajuste de tamanho no diálogo de impressão se necessário).

Novos recursos:

- Edição: botão `Editar` na coluna Ações preenche o formulário para alterar o lançamento.
- Exclusão: botão `Excluir` remove o lançamento.
- Filtros: use `De` e `Até` para filtrar lançamentos por período; o resumo mostra os totais do período filtrado.

Melhorias recentes:

- A data do formulário passa a vir preenchida com a data atual por padrão.
- Visual: layout atualizado com fontes, sombras e estilos de tabela mais limpos.
- Impressão/recibo: separação clara entre `ENTRADAS` e `SAÍDAS`, totais por seção e saldo final para facilitar conferência em impressoras térmicas.

Observações:

- A impressão direta para impressoras térmicas normalmente depende do driver/soft da impressora. O botão gera um layout estreito (80mm) pronto para imprimir; se precisar de comunicação direta via USB/ESC-POS, será necessário um serviço backend ou ferramenta específica.
