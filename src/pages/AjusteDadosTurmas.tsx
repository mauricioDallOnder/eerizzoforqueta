import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, TextField, Box, Typography } from '@mui/material';

export default function CorrigirDadosTurma() {
  const [resultado, setResultado] = useState('');
  const [carregando, setCarregando] = useState(false);

  const corrigirDados = async () => {
    setCarregando(true);
    try {
      const response = await axios.post('/api/AjustarDadosTurma');
      if (response.data.corrigidos || response.data.duplicados) {
        const corrigidosStr = response.data.corrigidos && response.data.corrigidos.length > 0 ? `Corrigidos: ${response.data.corrigidos.join(', ')}` : 'Nenhum aluno corrigido.';
        const duplicadosStr = response.data.duplicados && response.data.duplicados.length > 0 ? `\nDuplicados: ${response.data.duplicados.join(', ')}` : '\nNenhum duplicado encontrado.';
        setResultado(`${corrigidosStr}${duplicadosStr}`);
      } else {
        setResultado('A resposta do servidor não contém os campos esperados.');
      }
    } catch (error) {
      console.error('Erro ao corrigir dados da turma:', error);
      setResultado('Erro ao corrigir dados da turma.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        p: 3,
        backgroundColor: '#121212' // Fundo preto
      }}
    >
      <Typography variant="h5" gutterBottom component="div" sx={{ mb: 2, color: 'red' /* Verde claro para o texto */ }}>
        Verificação e correção de dados:
      </Typography>
      <TextField
        value={resultado}
        multiline
        rows={10}
        variant="outlined"
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
        sx={{
          bgcolor: '#37b409', // Cor de fundo para o campo de texto um pouco mais claro que o fundo
          color: 'black', // Texto em verde claro
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#66BB6A', // Verde
            },
            '&:hover fieldset': {
              borderColor: '#81C784', // Verde claro
            },
            '&.Mui-focused fieldset': {
              borderColor: '#A5D6A7', // Verde mais claro
            },
          }
        }}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          variant="contained"
          style={{ backgroundColor: 'red', color: 'white' }} // Botão em verde escuro com texto branco
          onClick={corrigirDados}
          disabled={carregando}
          startIcon={carregando ? <CircularProgress size={24} color="inherit" /> : null}
          sx={{ pl: 3, pr: 3, mt: 2 }} // Ajustes no padding e margem superior
        >
          {carregando ? 'Corrigindo... Aguarde' : 'Verificar e corrigir'}
        </Button>
      </Box>
    </Box>
  );
}
