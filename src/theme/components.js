// ESTILO / CSS GLOBAL DOS COMPONENTES (MUI)

// Este arquivo define o VISUAL PADRÃO / CSS de todos os componentes do sistema.

// As cores SEMPRE vêm da palette.
// EX: backgroundColor: theme.palette.primary.dark

export const components = {

// BOTÕES

  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        textTransform: "none",
        fontWeight: 600,
        padding: "10px 20px",
      }),

      containedPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,

        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      }),

      outlinedPrimary: ({ theme }) => ({
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,

        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
  },

// PARA CRIAR ESTILOS DE OUTROS COMPONENTES, ESCREVA O CODIGO AQUI

};
