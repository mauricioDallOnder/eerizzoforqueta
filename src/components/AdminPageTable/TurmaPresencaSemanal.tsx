/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import {
  Box,
  Modal,
  Typography,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material'
import { Aluno, TurmaPresencaSemanalProps } from '@/interface/interfaces'

export const TurmaPresencaSemanal: React.FC<TurmaPresencaSemanalProps> = ({
  alunosDaTurma,
  nomeDaTurma,
  isOpen,
  onClose,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']

  // Função para contar presenças diárias no mês selecionado
  const calculateDailyPresences = () => {
    const monthIndex = parseInt(selectedMonth, 10) + 1 // Ajustando para base-1 (Janeiro = 1)
    const year = new Date().getFullYear() // Considerando o ano atual para simplificar

    // Determinar o número de dias no mês selecionado
    const daysInMonth = new Date(year, monthIndex, 0).getDate()
    const dailyPresences = Array.from({ length: daysInMonth }, () => 0)

    alunosDaTurma.forEach((aluno) => {
      // Uso da verificação opcional encadeada para evitar erros se aluno for null/undefined
      // ou se aluno.presencas for null/undefined.
      Object.entries(aluno?.presencas || {}).forEach(([monthKey, days]) => {
        // Iterar sobre cada dia registrado em presencas
        Object.entries(days).forEach(([dayKey, isPresent]) => {
          const [day, month, yearKey] = dayKey.split('-').map(Number)
          if (month === monthIndex && yearKey === year && isPresent) {
            // Incrementa a contagem para o dia específico
            dailyPresences[day - 1]++
          }
        })
      })
    })

    return dailyPresences
  }

  const handleChangeMonth = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value)
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'fit-content', // Ocupar apenas o espaço necessário
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto',
          maxHeight: '80vh', // Ajuste para 80vh para não ocupar toda a altura
          '& .MuiTableCell-root': {
            padding: '8px', // Ajuste no padding para todas as células
            borderRight: '1px solid rgba(224, 224, 224, 1)', // Adicionando uma borda para separar as células
          },
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f5f5', // Fundo do cabeçalho da tabela
            fontWeight: 'bold', // Tornando o cabeçalho em negrito
          },
        }}
      >
        <Typography
          sx={{ color: 'black', mb: 2 }}
          variant="h6"
          gutterBottom
          component="div"
        >
          Total de presenças da turma: {nomeDaTurma} no mês de:{' '}
        </Typography>

        <Select
          fullWidth
          value={selectedMonth}
          onChange={handleChangeMonth}
          displayEmpty
          sx={{ mb: 3 }}
        >
          {months.map((month, index) => (
            <MenuItem key={index} value={index.toString()}>
              {month}
            </MenuItem>
          ))}
        </Select>
        {selectedMonth && (
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  {/* Cabeçalho da tabela com os dias do mês */}
                  {Array.from(
                    {
                      length: new Date(
                        2024,
                        parseInt(selectedMonth, 10) + 1,
                        0,
                      ).getDate(),
                    },
                    (_, index) => (
                      <TableCell key={index} align="center">
                        {index + 1}/{parseInt(selectedMonth, 10) + 1}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* Células com o total de presenças */}
                  {calculateDailyPresences().map((presence, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      style={{ minWidth: '50px', fontSize: '0.875rem' }}
                    >
                      {presence}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{ alignSelf: 'center', mt: '2px' }}
        >
          Fechar
        </Button>
      </Box>
    </Modal>
  )
}
