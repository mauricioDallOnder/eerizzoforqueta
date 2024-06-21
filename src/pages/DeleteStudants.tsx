import * as React from "react";
import {
  GridColDef,
  GridCsvExportOptions,
  GridCsvGetRowsToExportParams,
  GridRowId,
  GridRowsProp,
  GridToolbar,
  gridExpandedSortedRowIdsSelector,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { DataContext } from "@/context/context";
import { useEffect, useState } from "react";
import { AlunoComTurma } from "@/interface/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Button, Container, CircularProgress, Typography, Snackbar } from "@mui/material";
import Layout from "@/components/TopBarComponents/Layout";
import DownloadingIcon from "@mui/icons-material/Downloading";
import { StyledDataGrid } from "@/utils/Styles";
import axios from 'axios';

function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) =>
    gridExpandedSortedRowIdsSelector(apiRef);

  const handleExport = (options: GridCsvExportOptions) =>
    apiRef.current.exportDataAsCsv(options);

  return (
    <>
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={page + 1}
        count={pageCount}
        // @ts-expect-error
        renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
        onChange={(event: React.ChangeEvent<unknown>, value: number) =>
          apiRef.current.setPage(value - 1)
        }
      />
      <Button
        onClick={() => handleExport({ getRowsToExport: getFilteredRows })}
        sx={{ gap: "2px", display: "flex", alignItems: "center" }}
        variant="contained"
        color="secondary"
      >
        <DownloadingIcon />
        Exportar colunas selecionadas
      </Button>
    </>
  );
}

const PAGE_SIZE = 10;

export default function DeletarEtudantsDaTurma() {
  const { deleteStudentFromApi, modalidades, fetchModalidades } = React.useContext(DataContext);
  const [alunosComTurma, setAlunosComTurma] = useState<AlunoComTurma[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Record<GridRowId, AlunoComTurma>>({});
  const [isProcessing, setIsProcessing] = useState(false); // State to track processing
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message

  useEffect(() => {
    fetchModalidades().then((modalidadesFetched) => {
      const modalidadesValidas = modalidadesFetched.filter(
        (modalidade) => !["temporarios", "arquivados", "excluidos"].includes(modalidade.nome.toLowerCase())
      );

      const alunosComTurmaTemp: AlunoComTurma[] = modalidadesValidas.flatMap((modalidade) =>
        modalidade.turmas.flatMap((turma) => {
          const alunosArray = Array.isArray(turma.alunos) ? turma.alunos : [];
          return alunosArray.filter(Boolean).map((aluno): AlunoComTurma => ({
            aluno: {
              ...aluno,
              informacoesAdicionais: {
                ...aluno.informacoesAdicionais,
                IdentificadorUnico: aluno.informacoesAdicionais?.IdentificadorUnico ?? uuidv4(),
              },
            },
            nomeDaTurma: turma.nome_da_turma,
            categoria: turma.categoria,
            modalidade: turma.modalidade,
            uniforme: aluno.informacoesAdicionais?.hasUniforme ?? false,
          }));
        })
      );

      setAlunosComTurma(alunosComTurmaTemp);
    });
  }, [fetchModalidades]);

  const handleDelete = async (id: GridRowId) => {
    console.log("Iniciando deleção para ID:", id);
    setIsProcessing(true); // Set processing state to true

    const idParts = id.toString().split('_');
    const alunoId = idParts[0];
    const turmaNome = idParts.slice(1).join('_'); // Rejuntar todas as partes restantes para obter o nome completo da turma
    console.log("Aluno ID:", alunoId, "Turma Nome:", turmaNome);

    const alunoToDelete = alunosComTurma.find(aluno => 
      aluno.aluno.informacoesAdicionais?.IdentificadorUnico === alunoId && 
      aluno.nomeDaTurma === turmaNome
    );

    if (alunoToDelete) {
      console.log("Aluno encontrado para deleção:", alunoToDelete);
      // Chame a função de deletar aluno da API
      await deleteStudentFromApi({
        alunoId: alunoToDelete.aluno.informacoesAdicionais?.IdentificadorUnico,
        modalidade: alunoToDelete.modalidade,
        nomeDaTurma: alunoToDelete.nomeDaTurma,
        alunosNomes: alunoToDelete.aluno.nome
      });

      // Atualize a lista de alunos removendo o aluno deletado
      setAlunosComTurma(prev => prev.filter(aluno => 
        !(aluno.aluno.informacoesAdicionais?.IdentificadorUnico === alunoId && aluno.nomeDaTurma === turmaNome)
      ));

      // Chame a API para corrigir dados da turma
      await axios.post('/api/AjustarDadosTurma');

      setSuccessMessage("Aluno deletado com sucesso e dados da turma ajustados.");
    } else {
      console.log("Aluno não encontrado para deleção.");
    }

    setIsProcessing(false); // Set processing state to false
  };

  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  });

  const rows: GridRowsProp = alunosComTurma.map(
    ({ aluno, nomeDaTurma, categoria, modalidade }) => {
      return {
        id: `${aluno.informacoesAdicionais?.IdentificadorUnico}_${nomeDaTurma}`, // Usar IdentificadorUnico concatenado com nomeDaTurma como id
        col1: aluno.nome,
        col2: aluno.anoNascimento,
        col3: nomeDaTurma,
        col4: categoria,
        col5: modalidade,
      };
    }
  );

  const mergedRows = rows.map(row => ({
    ...row,
    ...(modifiedRows[row.id] ? { uniforme: modifiedRows[row.id].uniforme } : {})
  }));

  const columns: GridColDef[] = [
    { field: "col1", headerName: "Nome", width: 250 },
    { field: "col2", headerName: "Nascimento", width: 100 },
    { field: "col3", headerName: "Turma", width: 250 },
    { field: "col4", headerName: "Núcleo", width: 100 },
    { field: "col5", headerName: "Modalidade", width: 100 },
    {
      field: "DeletarAluno",
      headerName: "Deletar Aluno",
      width: 150,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            disabled={isProcessing} // Disable button while processing
          >
            Deletar
          </Button>
        );
      },
    }
   
  ];

  return (
    <>
      <Layout>
        <Container style={{ marginTop: "10px", height: "auto", width: "fit-content" }}>
          {isProcessing && (
            <Typography
              variant="h6"
              align="center"
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "#FFFFFF",
                padding: "10px",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              Ajustando dados da turma, por favor aguarde...
              <CircularProgress size={24} sx={{ ml: 2 }} />
            </Typography>
          )}
          <StyledDataGrid
            checkboxSelection
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[PAGE_SIZE]}
            slots={{
              pagination: CustomPagination,
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            rows={mergedRows}
            columns={columns}
          />
        </Container>
      </Layout>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </>
  );
}