/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from "react";
import {
  GridColDef,
  GridRowId,
  GridRowsProp,
  GridToolbar,
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

  TemporaryMoveStudentsPayload,
} from "@/interface/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Button, Container } from "@mui/material";

import Layout from "@/components/TopBarComponents/Layout";

import { StyledDataGrid } from "@/utils/Styles";
import { MoveAllStudentsMemo } from "@/components/MoveStudants/MoveAllStudents";




function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
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
    </>
  );
}

const PAGE_SIZE = 15;
export default function MoveStudantsTurma() {
  const { fetchModalidades } = useData();
  const [alunosComTurma, setAlunosComTurma] = useState<AlunoComTurma[]>([]);
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
    { field: "col2", headerName: "Nascimento", width: 150 },
    { field: "col3", headerName: "Turma", width: 250 },
    { field: "col4", headerName: "Núcleo", width: 150 },
    { field: "col5", headerName: "Modalidade", width: 150 },
    {
      field: "MudarTurma",
      headerName: "Mudar Turma",
      width: 150,
      renderCell: (params) => {



        const data: TemporaryMoveStudentsPayload = {
          alunoNome: params.row.col1,
          modalidadeOrigem: params.row.col5,
          nomeDaTurmaOrigem: params.row.col3,
          modalidadeDestino: "",
          nomeDaTurmaDestino: ""
        };


        // Use a propriedade sx para estilizar condicionalmente o botão com base em isSaved
        return (
          <MoveAllStudentsMemo alunoNome={data.alunoNome} nomeDaTurmaOrigem={data.nomeDaTurmaOrigem} modalidadeOrigem={data.modalidadeOrigem} />
        );
      },
    }

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