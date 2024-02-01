import React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { AdminTableProps, Aluno } from "@/interface/interfaces";

interface Presencas {
  [key: string]: boolean;
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
}: AdminTableProps) {
  const countMonthlyAbsence = (
    presencas: Record<string, Presencas>,
    month: string
  ): number => {
    const monthPresences = presencas[month];
    return monthPresences
      ? Object.values(monthPresences).filter((presence) => !presence).length
      : 0; // Conta quando a presença é falsa
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ border: "1px solid black" }} colSpan={13}>
              Turma: {nomeDaTurma} <br /> Total de Faltas Mês a Mês
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ border: "1px solid black" }}>Nome</TableCell>
            {months.map((month) => (
              <TableCell
                sx={{ border: "1px solid black" }}
                key={month}
                align="right"
              >
                {month}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {alunosDaTurma && alunosDaTurma.length > 0 ? (
            alunosDaTurma.map((aluno, index) => {
              // Verifica se o aluno é nulo ou se o ID está ausente antes de tentar renderizar a linha
              if (!aluno || !aluno.id) {
                // Não renderiza nada para este aluno
                return null;
              }
              // Continua com a renderização normal da linha, já que o aluno é válido
              return (
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
                      sx={{ border: "1px solid black" }}
                      key={monthIndex}
                      align="center"
                    >
                      {countMonthlyAbsence(aluno.presencas, month)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            // Exibe uma mensagem se não houver alunos na turma
            <TableRow>
              <TableCell colSpan={months.length + 1} align="center">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
