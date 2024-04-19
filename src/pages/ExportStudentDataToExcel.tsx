/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { useData } from "@/context/context";
import { useEffect, useState } from "react";
import {
  AlunoComTurma,
  IUpdateUniformeApiData,
} from "@/interface/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Button, Container} from "@mui/material";
import DownloadingIcon from "@mui/icons-material/Downloading";
import Layout from "@/components/TopBarComponents/Layout";
import { CustomCheckboxEdit } from "@/components/CustomEditableCheckbox";
import { StyledDataGrid } from "@/utils/Styles";




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
        Export Filtered rows
      </Button>
    </>
  );
}

const PAGE_SIZE = 15;
export default function ExportStudentDataToExcel() {
  const { fetchModalidades, updateUniformeInApi } = useData();
  const [alunosComTurma, setAlunosComTurma] = useState<AlunoComTurma[]>([]);
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});
  const [modifiedRows, setModifiedRows] = useState<
    Record<GridRowId, AlunoComTurma>
  >({});
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
  
  

  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  });
  

  const rows: GridRowsProp = alunosComTurma.map(
    ({ aluno, nomeDaTurma, categoria, modalidade }) => {
      return {
        id: aluno.informacoesAdicionais?.IdentificadorUnico ?? uuidv4(), // Usar IdentificadorUnico como id se disponível
        col1: aluno.nome,
        col2:aluno.anoNascimento,
        col3: nomeDaTurma,
        col4: categoria,
        col5: modalidade,
        uniforme: aluno.informacoesAdicionais.hasUniforme,
      };
    }
  );
  

  const mergedRows = rows.map(row => ({
    ...row,
    ...(modifiedRows[row.id] ? { uniforme: modifiedRows[row.id].uniforme } : {})
  }));
  

  const columns: GridColDef[] = [
    { field: "col1", headerName: "Nome", width: 250 },
    { field: "col2", headerName: "Nascimento", width: 250 },
    { field: "col3", headerName: "Turma", width: 250 },
    { field: "col4", headerName: "Núcleo", width: 150 },
    { field: "col5", headerName: "Modalidade", width: 150 },
    {
      field: "uniforme",
      headerName: "Uniforme",
      width: 150,
      type: "boolean",
      editable: true,
      renderEditCell: (params) => <CustomCheckboxEdit {...params} />,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (params) => {
        // Acesso direto a params aqui
        const isSaved = savedRows[params.row.id];
  
        const onSave = async () => {
          const data: IUpdateUniformeApiData = {
            modalidade: params.row.col4,
            nomeDaTurma: params.row.col2,
            alunoNome: params.row.col1,
            hasUniforme: params.row.uniforme,
          };
      
          try {
            await updateUniformeInApi(data);
            console.log("Uniforme atualizado com sucesso!");
    
            // Atualiza o estado para marcar a linha como "salva"
            setSavedRows(prev => ({
              ...prev,
              [params.row.id]: true,
            }));
    
            setModifiedRows(prev => ({
              ...prev,
              [params.row.id]: {
                ...prev[params.row.id],
                uniforme: data.hasUniforme,
              },
            }));
          } catch (error) {
            console.error("Erro ao atualizar o uniforme:", error);
          }
        };
    
        // Use a propriedade sx para estilizar condicionalmente o botão com base em isSaved
        return (
          <Button
            onClick={onSave}
            variant="contained"
            sx={{
              bgcolor: isSaved ? 'green' : 'red',
              '&:hover': {
                bgcolor: isSaved ? 'darkgreen' : 'darkred',
              },
            }}
          >
            {isSaved?"Salvo":"Salvar"}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Layout>
        <Container
          style={{ marginTop: "10px", height: "auto", width: "fit-content" }}
        >
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
    </>
  );
}
