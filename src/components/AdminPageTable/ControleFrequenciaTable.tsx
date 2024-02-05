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
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    border: "1px solid black",
                    display: "flex",
                    justifyContent: "space-between", // Alinha os itens nos extremos
                    alignItems: "center", // Centraliza verticalmente
                    width: "100%", // Ocupa toda a largura disponível
                    paddingRight: 2, // Garante um espaçamento interno à direita
                  }}
                  colSpan={13}
                >
                  <span>Turma: {nomeDaTurma} - Total de Faltas Mês a Mês</span>
                  <Button
                    onClick={onClose}
                    variant="contained"
                    color="error"
                    sx={{ ml: "auto" }}
                  >
                    Fechar
                  </Button>
                </TableCell>
              </TableRow>
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
      </Modal>
    </>
  );
}
