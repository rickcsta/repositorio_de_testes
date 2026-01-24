// TIPOGRAFIA / FONTES DO SISTEMA
// Para mudar as fontes do projeto inteiro, altere SOMENTE este arquivo.

// Sempre use <Typography variant="..." /> 
// EX:  <Typography variant="h1" >
//          aqui ficará o texto
//      </Typography>

export const typography = {
  h1: { 
    fontSize: "3.5rem",           
    fontWeight: 800,              
    lineHeight: 1.1,              
    letterSpacing: "-0.02em",     
    '@media (max-width:900px)': { 
      fontSize: "2.75rem"         
    },
    '@media (max-width:600px)': { 
      fontSize: "2.25rem"         
    },
  },

  // TÍTULO DE SEÇÃO

  h2: { 
    fontSize: "2.75rem",
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    '@media (max-width:900px)': { 
      fontSize: "2.25rem" 
    },
    '@media (max-width:600px)': { 
      fontSize: "1.875rem" 
    },
  },

  
  // SUBTÍTULO FORTE

  h3: { 
    fontSize: "2.25rem",
    fontWeight: 700,
    lineHeight: 1.3,
    '@media (max-width:600px)': { 
      fontSize: "1.75rem" 
    },
  },

  // SUBTÍTULO MÉDIO
  
  h4: { 
    fontSize: "1.875rem",
    fontWeight: 700,
    lineHeight: 1.4,
    '@media (max-width:600px)': { 
      fontSize: "1.5rem" 
    },
  },
  
  // TÍTULO DE CARD / BLOCO
  
  h5: { 
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // TÍTULO MENOR / LABEL IMPORTANTE
  
  h6: { 
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.6,
  },

  // TEXTO PADRÃO
  
  body1: { 
    fontSize: "1rem",
    lineHeight: 1.7,
    fontWeight: 400,
  },

  // TEXTO SECUNDÁRIO
  
  body2: { 
    fontSize: "0.875rem",
    lineHeight: 1.7,
    fontWeight: 400,
  },

  // SUBTÍTULO PADRÃO
  
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },

  // SUBTÍTULO MENOR
  
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },

  // TEXTO PEQUENO
  
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
    fontWeight: 400,
  },

  // TEXTO DE BOTÕES
  
  button: {
    textTransform: "none",        
    fontWeight: 600,
    fontSize: "0.875rem",
    letterSpacing: "0.01em",
    lineHeight: 1.5,
  },

  
  // TEXTO DECORATIVO / LABEL
  
  overline: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    lineHeight: 1.5,
  },
};
