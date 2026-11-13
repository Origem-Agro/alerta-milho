# Alerta de Doenças do Milho

Web app instalável (PWA) que mostra o risco de doenças do milho por município do Paraná, época, híbrido Forseed e estádio fenológico.

- **Dados:** Supabase, projeto `diagnostico-milho`, schema `alerta_milho`. A previsão vem da Open-Meteo e é atualizada uma vez por dia pela Edge Function `coleta-alerta-milho`.
- **Acesso:** login por e-mail e senha (Supabase Auth). Só usuários cadastrados em `alerta_milho.usuarios` veem os dados; o controle é feito no banco (RLS e funções `alerta_milho_base` e `alerta_milho_municipio`).
- **Hospedagem:** GitHub Pages, a partir da branch `main`.

A chave em `index.html` é a chave pública (publishable) do Supabase; ela não dá acesso aos dados sozinha.
