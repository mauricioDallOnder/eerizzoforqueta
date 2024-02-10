import React, { useState, useEffect, ChangeEvent } from "react";
import { useData } from "@/context/context";
import { Aluno } from "@/interface/interfaces";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  TablePagination,
  LinearProgress,
  AlertProps,
  Snackbar,
  tableCellClasses,
  Container,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCopyToClipboard } from "@/hooks/CopyToClipboardHook";
import { v4 as uuidv4 } from "uuid";
import { normalizeText } from "@/utils/Constants";
import ResponsiveAppBar from "@/components/TopBarComponents/TopBar";
import Layout from "@/components/TopBarComponents/Layout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
interface AlunoComTurma {
  aluno: Aluno;
  nomeDaTurma: string;
  uniqueId: string; // Adicionando um campo para o ID único
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(8px)",
  boxShadow: theme.shadows[1],
  color: theme.palette.text.primary,
  borderRadius: "8px",
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontSize: 16,
    minWidth: 100, // Set a minimum width for the header cells
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
    minWidth: 100, // Set a minimum width for the body cells
  },
  "&:hover": {
    background: "#22c55e",
    fontWeight: "bold",
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
    paddingTop: 16,
    paddingLeft: 16,
    paddingBottom: 10,
  },
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  marginBottom: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.7)",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.light,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& input": {
    color: theme.palette.text.primary,
  },
  "& label": {
    color: "rgba(0, 0, 0, 0.7)",
  },
  "& label.Mui-focused": {
    color: theme.palette.primary.main,
  },
}));

export default function TurmasTemporariosTable() {
  const { fetchModalidades } = useData();
  const [copiedText, copy] = useCopyToClipboard();
  const [alunosComTurma, setAlunosComTurma] = useState<AlunoComTurma[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
    return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        console.log("Copied!", { text });
      })
      .catch((error) => {
        console.error("Failed to copy!", error);
      });
  };

  useEffect(() => {
    setLoading(true); // Indicar que o carregamento está em andamento
    fetchModalidades().then((modalidadesFetched) => {
      // Inicialize um array temporário para armazenar os alunos com as informações da turma e um UUID único
      const alunosComTurmaTemp: AlunoComTurma[] = [];

      // Percorra as modalidades de interesse
      modalidadesFetched.forEach((modalidade) => {
        if (
          ["temporarios", "volei", "futsal", "futebol"].includes(
            modalidade.nome.toLowerCase()
          )
        ) {
          // Percorra as turmas dentro da modalidade
          modalidade.turmas.forEach((turma) => {
            // Garanta que turma.alunos seja um array antes de continuar
            if (Array.isArray(turma.alunos)) {
              // Percorra os alunos da turma
              turma.alunos.forEach((aluno) => {
                // Se o aluno não for nulo ou undefined, adicione-o ao array temporário com um UUID único
                if (aluno) {
                  alunosComTurmaTemp.push({
                    aluno,
                    nomeDaTurma: turma.nome_da_turma,
                    uniqueId: uuidv4(), // Gera um UUID único para cada aluno
                  });
                }
              });
            }
          });
        }
      });

      // Atualize o estado com os alunos e informações das turmas processadas
      setAlunosComTurma(alunosComTurmaTemp);
      setLoading(false); // O carregamento está concluído
    });
  }, [fetchModalidades]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAlunosComTurma = alunosComTurma.filter(
    ({ aluno, nomeDaTurma }) => {
      const searchNormalized = normalizeText(searchTerm);
      // Crie uma lista de strings a serem verificadas, certificando-se de que cada campo seja seguro para acessar
      const camposParaPesquisa = [
        normalizeText(aluno.nome),
        normalizeText(aluno.anoNascimento),
        normalizeText(String(aluno.dataMatricula))
          ? normalizeText(String(aluno.dataMatricula))
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(aluno.informacoesAdicionais.rg)
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(aluno.informacoesAdicionais.uniforme)
          : "",
        normalizeText(String(aluno.telefoneComWhatsapp)),
        normalizeText(nomeDaTurma),
        aluno.informacoesAdicionais
          ? normalizeText(aluno.informacoesAdicionais.irmaos)
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(aluno.informacoesAdicionais.nomefuncionarioJBS)
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(aluno.informacoesAdicionais.nomefuncionariomarcopolo)
          : "",
        aluno.informacoesAdicionais && aluno.informacoesAdicionais.endereco
          ? normalizeText(aluno.informacoesAdicionais.endereco.ruaAvenida)
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(
              aluno.informacoesAdicionais.pagadorMensalidades?.nomeCompleto
            )
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(
              String(aluno.informacoesAdicionais.pagadorMensalidades?.cpf)
            )
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(
              aluno.informacoesAdicionais.pagadorMensalidades?.email
            )
          : "",
        aluno.informacoesAdicionais
          ? normalizeText(
              String(
                aluno.informacoesAdicionais.pagadorMensalidades?.celularWhatsapp
              )
            )
          : "",
        // Adicione mais campos conforme necessário
      ];

      // Verifique se algum dos campos normalizados contém o termo de pesquisa normalizado
      return camposParaPesquisa.some((campo) =>
        campo.includes(searchNormalized)
      );
    }
  );

  return (
    <Layout>
      <Box
        sx={{ margin: "auto", width: "90%", height: "90%", padding: "16px" }}
      >
        <Box sx={{ marginTop: 4, width: "100%", height: "100%" }}>
          <Box
            sx={{
              background: "transparent",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: "#FFFFFF",
                marginBottom: "24px",
                fontWeight: "bold",
              }}
            >
              Lista de Atletas e suas informações
            </Typography>
            {loading && <LinearProgress color="secondary" />}
            <SearchInput
              variant="outlined"
              placeholder="Pesquisar por nome do aluno ou turma"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <StyledTableContainer>
              <Table aria-label="collapsible table">
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                    >
                      Foto do Atleta
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                    >
                      Nome do Atleta
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Data de Nascimento
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Documento do Atleta
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Telefone
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Endereço
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Uniforme
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Irmãos
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Filho de func.JBS?
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Nome do func.JBS?
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Filho de func.Marcopolo?
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Nome do func.Marcopolo
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="center"
                    >
                      Turma
                    </StyledTableCell>

                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="left"
                    >
                      Responsável Financeiro
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="left"
                    >
                      Telefone do Responsável
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="left"
                    >
                      CPF do Responsável
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="left"
                    >
                      E-mail do Responsável Financeiro
                    </StyledTableCell>
                    <StyledTableCell
                      sx={{
                        borderBottom: "1px solid black",
                        fontWeight: "bold",
                      }}
                      align="left"
                    >
                      Data de Ingresso
                    </StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? filteredAlunosComTurma.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : filteredAlunosComTurma
                  ).map(({ aluno, nomeDaTurma }, index) => (
                    <React.Fragment key={index}>
                      <StyledTableRow
                        sx={{ "& > *": { borderBottom: "unset" } }}
                      >
                        <StyledTableCell  sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}>
                          <Avatar
                            sx={{
                              width: 80, // tamanho do Avatar
                              height: 80, // tamanho do Avatar
                              // boxShadow: 'none' // Descomente se necessário
                              backgroundColor: "white",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                          
                            <img
                              src={aluno.foto!}
                              alt="Avatar"
                              style={{
                                width: "100%", // Isso fará com que a imagem preencha a largura da caixa
                                height: "100%", // Isso fará com que a imagem preencha a altura da caixa
                                objectFit: "cover", // Isso fará com que a imagem cubra todo o espaço disponível, cortando o excesso
                              }}
                            />
                          </Avatar>
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          component="th"
                          scope="row"
                          onClick={handleCopy(aluno.nome)}
                          align="center"
                        >
                          {aluno.nome}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(aluno.anoNascimento)}
                        >
                          {aluno.anoNascimento}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(aluno.informacoesAdicionais?.rg)}
                        >
                          {aluno.informacoesAdicionais?.rg || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            String(aluno.telefoneComWhatsapp)
                          )}
                        >
                          {aluno.telefoneComWhatsapp}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais &&
                              aluno.informacoesAdicionais.endereco
                              ? `${
                                  aluno.informacoesAdicionais.endereco
                                    .ruaAvenida
                                }, ${
                                  aluno.informacoesAdicionais.endereco
                                    .numeroResidencia || "N/A"
                                }`
                              : "N/A"
                          )}
                        >
                          {aluno.informacoesAdicionais &&
                          aluno.informacoesAdicionais.endereco
                            ? `${
                                aluno.informacoesAdicionais.endereco.ruaAvenida
                              }, ${
                                aluno.informacoesAdicionais.endereco
                                  .numeroResidencia || "N/A"
                              }`
                            : "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais?.uniforme
                          )}
                        >
                          {aluno.informacoesAdicionais?.uniforme || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais?.irmaos
                          )}
                        >
                          {aluno.informacoesAdicionais?.irmaos || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais?.filhofuncionarioJBS
                          )}
                        >
                          {aluno.informacoesAdicionais?.filhofuncionarioJBS ||
                            "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais?.nomefuncionarioJBS
                          )}
                        >
                          {aluno.informacoesAdicionais?.nomefuncionarioJBS ||
                            "N/A"}
                        </StyledTableCell>

                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais
                              ?.filhofuncionariomarcopolo
                          )}
                        >
                          {aluno.informacoesAdicionais
                            ?.filhofuncionariomarcopolo || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais
                              ?.nomefuncionariomarcopolo
                          )}
                        >
                          {aluno.informacoesAdicionais
                            ?.nomefuncionariomarcopolo || "N/A"}
                        </StyledTableCell>

                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(nomeDaTurma)}
                        >
                          {nomeDaTurma}
                        </StyledTableCell>

                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            aluno.informacoesAdicionais?.pagadorMensalidades
                              ?.nomeCompleto
                          )}
                        >
                          {aluno.informacoesAdicionais?.pagadorMensalidades
                            ?.nomeCompleto || "N/A"}
                        </StyledTableCell>

                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            String(
                              aluno.informacoesAdicionais?.pagadorMensalidades
                                ?.celularWhatsapp
                            )
                          )}
                        >
                          {aluno.informacoesAdicionais?.pagadorMensalidades
                            ?.celularWhatsapp || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            String(
                              aluno.informacoesAdicionais?.pagadorMensalidades
                                ?.cpf
                            )
                          )}
                        >
                          {aluno.informacoesAdicionais?.pagadorMensalidades
                            ?.cpf || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(
                            String(
                              aluno.informacoesAdicionais?.pagadorMensalidades
                                ?.email
                            )
                          )}
                        >
                          {aluno.informacoesAdicionais?.pagadorMensalidades
                            ?.email || "N/A"}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{
                            borderBottom: "1px solid black",
                            cursor: "pointer",
                          }}
                          align="center"
                          onClick={handleCopy(String(aluno?.dataMatricula))}
                        >
                          {aluno?.dataMatricula || "N/A"}
                        </StyledTableCell>
                      </StyledTableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
            <Box sx={{ backgroundColor: "white", color: "black" }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAlunosComTurma.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Se não tiver sessão ou não for admin, redirecione para a página de login
  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/NotAllowPage",
        permanent: false,
      },
    };
  }

  // Retornar props aqui se a permissão for válida
  return {
    props: {
      /* props adicionais aqui */
    },
  };
};
