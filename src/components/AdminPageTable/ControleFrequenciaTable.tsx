import React, { useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Container,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { AdminTableProps, Aluno } from "@/interface/interfaces";
import Modal from "@mui/material/Modal";
import { modalStyleTemporaly } from "@/utils/Styles";
// Props adicionais para o modal
interface ControleFrequenciaTableProps extends AdminTableProps {
  isOpen: boolean;
  onClose: () => void;
}
const months = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export default function ControleFrequenciaTable({
  alunosDaTurma,
  nomeDaTurma,
  isOpen,
  onClose,
}: ControleFrequenciaTableProps) {
  // Função para contar as faltas mensais
  const countMonthlyAbsence = (
    presencas: Record<string, Record<string, boolean>>,
    month: string
  ): number => {
    const monthPresences = presencas[month];
    return monthPresences
      ? Object.values(monthPresences).filter((presence) => !presence).length
      : 0;
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title">
      <Box
  sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' }, // Responsivo
    maxHeight: '90vh',
    overflowY: 'auto', // Para tabelas grandes
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  }}
>
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      pb: 2, // Espaçamento no fundo do cabeçalho
    }}
  >
    <Typography variant="h6" component="h2" sx={{color:"black"}}>
      Turma: {nomeDaTurma} - Total de Faltas Mês a Mês
    </Typography>
    <Button onClick={onClose} variant="contained" color="error">
      Fechar
    </Button>
  </Box>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              
              <TableRow>
                <TableCell sx={{ border: "1px solid black" }}>Nome</TableCell>
                {months.map((month) => (
                  <TableCell
                    key={month}
                    sx={{ border: "1px solid black" }}
                    align="right"
                  >
                    {month.charAt(0).toUpperCase() + month.slice(1)}{" "}
                    {/* Capitalize month names */}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {alunosDaTurma.length > 0 ? (
                alunosDaTurma.map((aluno: Aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      component="th"
                      scope="row"
                    >
                      {aluno.nome}
                    </TableCell>
                    {months.map((month, monthIndex) => (
                      <TableCell
                        key={monthIndex}
                        sx={{ border: "1px solid black" }}
                        align="center"
                      >
                        {countMonthlyAbsence(aluno.presencas, month)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={months.length + 1} align="center">
                    Nenhum aluno encontrado para o termo de busca.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      </Modal>
    </>
  );
}
