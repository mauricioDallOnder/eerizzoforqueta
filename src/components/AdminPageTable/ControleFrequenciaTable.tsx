import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AdminTableProps, Aluno } from '@/interface/interfaces';
import Modal from '@mui/material/Modal';

// Props adicionais para o modal
interface ControleFrequenciaTableProps extends AdminTableProps {
  isOpen: boolean;
  onClose: () => void;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

export default function ControleFrequenciaTable({
  alunosDaTurma,
  nomeDaTurma,
  isOpen,
  onClose,
}: ControleFrequenciaTableProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Função para contar as faltas mensais
  const countMonthlyAbsence = (
    presencas: Record<string, Record<string, boolean>>,
    month: string,
  ): number => {
    const monthPresences = presencas[month];
    return monthPresences
      ? Object.values(monthPresences).filter((presence) => !presence).length
      : 0;
  };

  // Filtrar para garantir que não há alunos nulos no array antes de mapeá-los
  const validAlunosDaTurma = alunosDaTurma.filter(Boolean);

  // Função de comparação para ordenar alunos por nome
  const compareByName = (a: Aluno, b: Aluno) => {
    if (a.nome < b.nome) return -1;
    if (a.nome > b.nome) return 1;
    return 0;
  };

  // Ordenar os alunos por nome
  const sortedAlunosDaTurma = validAlunosDaTurma.sort(compareByName);

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: fullScreen ? '90%' : '60%', // Ajusta a largura baseado na condição de tela cheia
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          overflowY: 'auto', // Scroll vertical se necessário
          maxHeight: '90vh',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ color: 'black', mb: 3 }}
        >
          Turma: {nomeDaTurma} - Total de Faltas Mês a Mês
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table stickyHeader aria-label="tabela de frequência">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                  Nome
                </TableCell>
                {months.map((month) => (
                  <TableCell key={month} align="center" sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAlunosDaTurma.length > 0 ? (
                sortedAlunosDaTurma.map((aluno: Aluno, index) => (
                  <TableRow key={aluno.id} sx={{ bgcolor: index % 2 === 0 ? 'background.default' : 'grey.100' }}>
                    <TableCell sx={{ color: 'text.primary' }}>{aluno.nome}</TableCell>
                    {months.map((month) => (
                      <TableCell key={month} align="center" sx={{ color: 'text.primary' }}>
                        {countMonthlyAbsence(aluno.presencas, month)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ bgcolor: 'grey.200', color: 'text.primary' }}>
                    Nenhum aluno encontrado nesta turma.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} variant="contained" color="primary">
            Fechar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
