// Cria o tema global do Material UI
// Todas as telas do sistema usam este theme

//  NÃO ESTILIZE COMPONENTES AQUI.

//  Para mudanças:
//   - Cores        → palette.js
//   - Tipografia   → typography.js
//   - Componentes  → components.js

import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";
import { components } from "./components";

const theme = createTheme({
  palette,
  typography,
  components,
});

export default theme;
