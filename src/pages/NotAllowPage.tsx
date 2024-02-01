import React from 'react';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Layout from '@/components/TopBarComponents/Layout';

export default function Error() {
  const theme = useTheme();

  return (
    <Layout>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: "column",
        alignItems: 'center',
        bgcolor: theme.palette.background.default,
        color: theme.palette.error.main,
        marginTop: "20px",
        marginBottom: "20px",
        borderRadius: "20px",
        padding: theme.spacing(3),
        boxShadow: theme.shadows[5],
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" gutterBottom>
              Acesso Restrito
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Para acessar essa página, faça login com um usuário autorizado.
            </Typography>
            <Button variant="contained" color="primary" href="/LoginPage" sx={{ mt: 2 }}>
             Fazer Login
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              component="img"
              src="https://cdn.pixabay.com/photo/2016/05/05/22/31/stop-1374937_960_720.jpg"
              alt="Acesso Restrito"
              sx={{
                width: '100%',
                maxHeight: 300,
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
    </Layout>
  );
}
