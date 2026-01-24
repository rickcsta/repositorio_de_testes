"use client";

import { Button, Typography, Card } from "@mui/material";

export default function Home() {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h4">
        Funcionou 🎉
      </Typography>

      <Button variant="contained" color="primary" >
        Botão do Design System
      </Button>
    </Card>
  );
}
