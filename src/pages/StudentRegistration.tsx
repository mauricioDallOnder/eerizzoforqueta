/* eslint-disable @typescript-eslint/no-unused-vars */
import { useForm, SubmitHandler } from "react-hook-form";
import {
  FormValuesStudent,
  SelecaoModalidadeTurma,
  Turma,
  formValuesStudentSchema,
} from "@/interface/interfaces";
import React, { useEffect, useState } from "react";
import {
  fieldsDadosGeraisAtleta,
  fieldsEndereco,
  fieldsIdentificacao,
  fieldsResponsavelMensalidade,
  fieldsTermosAvisos,
  getErrorMessage,
  opcoesTermosAvisos,
  vinculosempresasparceiras,
} from "@/utils/Constants";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  List,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { BoxStyleCadastro, ListStyle, TituloSecaoStyle } from "@/utils/Styles";
import { useData } from "@/context/context";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import "react-image-crop/dist/ReactCrop.css";
import { storage } from "../config/firestoreConfig";
import resizeImage from "../utils/Constants";
import { v4 as uuidv4 } from "uuid";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from 'axios';
import { CorrigirDadosDefinitivos } from "@/utils/CorrigirDadosTurmasEmComponetes";
export default function StudentRegistration() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValuesStudent>({
    resolver: zodResolver(formValuesStudentSchema),
    defaultValues: {
      modalidade: "", 
      turmaSelecionada: "", 
      aluno: {
        informacoesAdicionais: {
          uniforme: "", 
        },
       
      },
     
    },
  });
  const { modalidades, fetchModalidades, sendDataToApi } = useData(); // Usando o hook useData

  // upload de imagem----------------------------
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("onFileChange - Início");
    const file = event.target.files![0];
    try {
      const resizedImageUrl = await resizeImage(file);
      setFile(
        new File([await (await fetch(resizedImageUrl)).blob()], file.name)
      );
      setAvatarUrl(resizedImageUrl);
      console.log("onFileChange - Imagem processada");
    } catch (error) {
      console.error(error);
      console.error("onFileChange - Erro", error);
    }
  };

  useEffect(() => {
    fetchModalidades();
  }, [fetchModalidades]);
  // ----------------------------------------------------------------------------
  // seleção de modalidades

  const [selecoes, setSelecoes] = useState<SelecaoModalidadeTurma[]>([
    {
      modalidade: "",
      nucleo: "",
      turma: "",
      turmasDisponiveis: [],
    },
  ]);

  // Função para adicionar nova seleção de modalidade e turma
  const adicionarSelecao = () => {
    setSelecoes((prevSelecoes) => [
      ...prevSelecoes,
      {
        modalidade: "",
        nucleo: "",
        turma: "",
        turmasDisponiveis: [],
      },
    ]);
  };

  // Função para atualizar seleções de modalidade, núcleo e turma
  const atualizarSelecao = (
    index: number,
    campo: keyof SelecaoModalidadeTurma,
    valor: string | Turma[]
  ) => {
    setSelecoes((prevSelecoes) => {
      return prevSelecoes.map((selecao, idx) => {
        if (idx === index) {
          if (campo === "turmasDisponiveis" && Array.isArray(valor)) {
            // Garantindo que valor é um array de Turma para o campo 'turmasDisponiveis'
            return { ...selecao, [campo]: valor };
          } else if (typeof valor === "string") {
            // Para campos 'modalidade', 'nucleo' e 'turma', o valor é uma string
            const novaSelecao = { ...selecao, [campo]: valor };

            // Se o campo for 'nucleo', atualiza as turmas disponíveis
            if (campo === "nucleo") {
              const modalidadeSelecionada = novaSelecao.modalidade;
              const turmasFiltradas = atualizarTurmasDisponiveis(
                modalidadeSelecionada,
                valor,
                index
              );
              novaSelecao.turmasDisponiveis! = turmasFiltradas;
            }

            // Se o campo for 'modalidade', reset 'nucleo' e 'turma'
            if (campo === "modalidade") {
              novaSelecao.nucleo = "";
              novaSelecao.turma = "";
              novaSelecao.turmasDisponiveis = [];
            }

            return novaSelecao;
          }
        }
        return selecao;
      });
    });
  };

  const atualizarTurmasDisponiveis = (
    modalidade: string,
    nucleo: string,
    index: number
  ): Turma[] => {
    // Suponha que essa função retorne as turmas filtradas baseadas na modalidade e no núcleo
    const turmas = modalidades.find((m) => m.nome === modalidade)?.turmas ?? [];
    return turmas.filter((turma) => turma.nucleo === nucleo);
  };

  const removerSelecao = (index: number) => {
    setSelecoes((prevSelecoes) =>
      prevSelecoes.filter((_, idx) => idx !== index)
    );
  };
  const key = uuidv4();
  // Função para gerar os seletores de modalidade, núcleo e turma
  const renderizarSeletores = () => {
    return selecoes.map((selecao, index) => (
      <Grid container spacing={2} key={index}>
        <Grid item xs={12} sm={4}>
          <TextField
            sx={{ marginTop: "12px" }}
            select
            label="Modalidade"
            fullWidth
            variant="outlined"
            value={selecao.modalidade}
            onChange={(e) =>
              atualizarSelecao(index, "modalidade", e.target.value)
            }
            required
          >
            {modalidades
              .filter(
                (modalidade) =>
                  modalidade.nome !== "temporarios" &&
                  modalidade.nome !== "arquivados" &&
                  modalidade.nome !== "excluidos"
              )
              .map((modalidade) => (
                <MenuItem key={modalidade.nome} value={modalidade.nome}>
                  {modalidade.nome}
                </MenuItem>
              ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            sx={{ marginTop: "12px" }}
            select
            label="Local de treinamento"
            fullWidth
            variant="outlined"
            value={selecao.nucleo}
            onChange={(e) => atualizarSelecao(index, "nucleo", e.target.value)}
            required
          >
            {selecao.modalidade &&
              modalidades
                .find((m) => m.nome === selecao.modalidade)
                ?.turmas.map((turma) => turma.nucleo)
                .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicatas
                .map((nucleo) => (
                  <MenuItem key={nucleo} value={nucleo}>
                    {nucleo}
                  </MenuItem>
                ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            sx={{ marginTop: "12px" }}
            select
            label="Turma"
            fullWidth
            variant="outlined"
            value={selecao.turma}
            onChange={(e) => atualizarSelecao(index, "turma", e.target.value)}
            required
          >
            {selecao.turmasDisponiveis!.map((turma, index) => (
              <MenuItem
                key={`${turma.nome_da_turma}-${index}`}
                value={turma.nome_da_turma}
              >
                {turma.nome_da_turma}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={2} sm={1}>
          <Button
            variant="contained"
            color="error"
            sx={{ mb: "5px" }}
            onClick={() => removerSelecao(index)}
            disabled={selecoes.length === 1}
          >
            Remover
          </Button>
        </Grid>
        {index < selecoes.length - 1 && (
          <Divider sx={{ width: "100%", my: 2 }} />
        )}
      </Grid>
    ));
  };

  const onSubmit: SubmitHandler<FormValuesStudent> = async (formData) => {
    console.log("onSubmit - Início");

    if (selecoes.length === 0) {
      alert("Por favor, adicione pelo menos uma modalidade e turma.");
      return;
    }
    let fotoUrl = "";
    if (file) {
      setIsUploading(true);
      try {
        const fileName = uuidv4() + file.name;
        const fileRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(fileRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // opcional: atualizar o progresso do upload aqui
            },
            (error) => {
              console.error("Erro no upload:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              // Use a URL obtida aqui como valor para o campo 'foto'
              fotoUrl = downloadURL; // Atualize a lógica conforme necessário
              resolve(downloadURL);
            }
          );
        });
      } catch (error) {
        console.error("Falha no upload:", error);
        setIsUploading(false);
        // Gerenciar erro de upload aqui
        return;
      }
    }

    // Preparar dados para enviar, incluindo a URL da imagem carregada

    const mydate = new Date(Date.now()).toLocaleString().split(",")[0];
    const uniforme = false
    formData.aluno.dataMatricula = mydate;
    formData.aluno.informacoesAdicionais.hasUniforme = uniforme;
    formData.aluno.informacoesAdicionais.IdentificadorUnico = uuidv4()
    const dataParaProcessar = selecoes.map((selecao) => ({
      ...formData, // Espalha os dados do formulário
      modalidade: selecao.modalidade,
      turmaSelecionada: selecao.turma,
      aluno: {
        ...formData.aluno,
        foto: fotoUrl, // Assegure-se de que esta é a URL do Firebase
      },
    }));

    try {
      const { resultados } = await sendDataToApi(dataParaProcessar);
      // Verificar se todos os cadastros foram bem-sucedidos
      const todosSucessos = resultados.every((resultado) => resultado.sucesso);
      if (todosSucessos) {
        alert("Todos os cadastros foram efetuados com sucesso!");
        resetFormulario();
      } else {
        // Processar e exibir mensagens de erro específicas
        const mensagensErro = resultados
          .filter((resultado) => !resultado.sucesso)
          .map((resultado) => resultado.erro)
          .join("\n");
        alert(`O cadastro falhou, motivo:\n${mensagensErro}`);
      }
    } catch (error) {
      console.error("Erro ao enviar dados dos alunos: ", error);
      alert(
        "Ocorreu um erro ao tentar realizar o cadastro. Por favor, tente novamente."
      );
    }
  };

  
  // Função para resetar o formulário e estados relacionados
  const resetFormulario = () => {
    reset(); // Reseta o formulário usando react-hook-form
    setSelecoes([
      { modalidade: "", nucleo: "", turma: "", turmasDisponiveis: [] },
    ]); // Reseta as seleções
    setFile(null);
    setAvatarUrl("");
    setIsUploading(false);
    setUploadProgress(0);
    CorrigirDadosDefinitivos();
  };

  return (
    <Layout>
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={BoxStyleCadastro}>
            <Box sx={{ display: "table", width: "100%" }}>
              <HeaderForm titulo={"Cadastro de Atletas"} />
            </Box>
            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 1 - Identificação do Aluno
              </Typography>
              <Grid container spacing={2}>
                {fieldsIdentificacao.map(({ label, id }) => (
                  <Grid item xs={12} sm={6} key={id}>
                    <TextField
                      fullWidth
                      label={label}
                      variant="standard"
                      error={Boolean(getErrorMessage(errors, id))} // Verifica se existe erro
                      helperText={getErrorMessage(errors, id)} // Mostra a mensagem de erro
                      {...register(id as keyof FormValuesStudent)}
                    />
                  </Grid>
                ))}

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      border: "1px dashed grey",
                      borderRadius: "4px", // Se você quiser cantos arredondados, senão remova esta linha
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%", // Largura total do contêiner
                      height: "200px", // Ajuste conforme necessário para altura
                      overflow: "hidden", // Isso garantirá que a imagem não ultrapasse a caixa
                      position: "relative", // Posicionamento relativo para elementos internos absolutos
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                        cursor: "pointer",
                      },
                    }}
                  >
                    {avatarUrl ? (
                      <>
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          style={{
                            width: "100%", // Isso fará com que a imagem preencha a largura da caixa
                            height: "100%", // Isso fará com que a imagem preencha a altura da caixa
                            objectFit: "cover", // Isso fará com que a imagem cubra todo o espaço disponível, cortando o excesso
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute", // Posicionamento absoluto para sobrepor a imagem
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo translúcido para o texto ser legível
                            color: "white",
                            textAlign: "center",
                            p: "8px",
                          }}
                        >
                          <Button
                            variant="contained"
                            component="label"
                            size="small"
                            color="primary"
                          >
                            Alterar Foto do Atleta
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={onFileChange}
                            />
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        component="label"
                        size="small"
                        color="primary"
                      >
                        Carregar Foto do Atleta
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={onFileChange}
                        />
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 2 - Informações Pessoais e de Saúde do Aluno
              </Typography>
              <Grid container spacing={2}>
                {fieldsDadosGeraisAtleta.map(({ label, id }) => (
                  <Grid item xs={12} sm={6} key={id}>
                    <TextField
                      fullWidth
                      id={id}
                      label={label}
                      variant="standard"
                      sx={{
                        borderRadius: "4px",
                      }}
                      error={Boolean(getErrorMessage(errors, id))} // Verifica se existe erro
                      helperText={getErrorMessage(errors, id)} // Mostra a mensagem de erro
                      {...register(id as keyof FormValuesStudent)}
                    />
                  </Grid>
                ))}
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 3 - Endereço Residencial do Aluno
              </Typography>
              <Grid container spacing={2}>
                {fieldsEndereco.map(({ label, id }) => (
                  <Grid item xs={12} sm={6} key={id}>
                    <TextField
                      fullWidth
                      id={id}
                      label={label}
                      variant="standard"
                      sx={{
                        borderRadius: "4px",
                      }}
                      required
                      error={Boolean(getErrorMessage(errors, id))} // Verifica se existe erro
                      helperText={getErrorMessage(errors, id)} // Mostra a mensagem de erro
                      {...register(id as keyof FormValuesStudent)}
                    />
                  </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Complemento"
                    variant="standard"
                    sx={{
                      borderRadius: "4px",
                    }}
                    {...register(
                      "aluno.informacoesAdicionais.endereco.complemento"
                    )} // asserção de tipo aqui
                  />
                </Grid>
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 4 - Informações do Responsável Financeiro
              </Typography>
              <Grid container spacing={2}>
                {fieldsResponsavelMensalidade.map(({ label, id }) => (
                  <Grid item xs={12} sm={6} key={id}>
                    <TextField
                      fullWidth
                      id={id}
                      label={label}
                      variant="standard"
                      sx={{
                        borderRadius: "4px",
                      }}
                      error={Boolean(getErrorMessage(errors, id))} // Verifica se existe erro
                      helperText={getErrorMessage(errors, id)} // Mostra a mensagem de erro
                      required
                      {...register(id as keyof FormValuesStudent)} // asserção de tipo aqui
                    />
                  </Grid>
                ))}
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 5 - Conexões com Empresas Parceiras
              </Typography>
              <Grid container spacing={2}>
                {vinculosempresasparceiras.map(({ label, id }) => (
                  <Grid item xs={12} sm={6} key={id}>
                    <TextField
                      fullWidth
                      id={id}
                      label={label}
                      variant="standard"
                      sx={{
                        borderRadius: "4px",
                      }}
                      error={Boolean(getErrorMessage(errors, id))} // Verifica se existe erro
                      helperText={getErrorMessage(errors, id)} // Mostra a mensagem de erro
                      required
                      {...register(id as keyof FormValuesStudent)} // asserção de tipo aqui
                    />
                  </Grid>
                ))}
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 6 - Especificações sobre o Uniforme
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    defaultValue={""}
                    label="Tamanho do Uniforme"
                    variant="outlined"
                    fullWidth
                    required
                    {...register("aluno.informacoesAdicionais.uniforme")} // asserção de tipo aqui
                    helperText="Selecione o tamanho do uniforme"
                    error={!!errors.aluno?.informacoesAdicionais?.uniforme}
                  >
                    {[
                      { value: "Pi - 6", label: "Pi - 6" },
                      { value: "Mi - 8", label: "Mi - 8" },
                      { value: "Gi - 10", label: "Gi - 10" },
                      { value: "GGi - 12", label: "GGi - 12" },
                      { value: "PP - 14", label: "PP - 14" },
                      { value: "P adulto", label: "P adulto" },
                      { value: "M adulto", label: "M adulto" },
                      { value: "G adulto", label: "G adulto" },
                      { value: "GG adulto", label: "GG adulto" },
                      {
                        value: "Outro",
                        label: "Outro (informar pelo Whatsapp)",
                      },
                    ].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 8 - Escolha de Modalidades e Turmas
              </Typography>
              <Grid container spacing={2}>
                {renderizarSeletores()}
                <Divider sx={{ width: "100%", my: 2 }} />
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={adicionarSelecao}
                    disabled={selecoes.length >= 3} // Desabilita o botão se já existirem 3 ou mais seleções
                  >
                    Adicionar Modalidade/Turma
                  </Button>
                  {selecoes.length >= 3 && ( // Exibe a mensagem se o limite for atingido
                    <Typography color="error" sx={{ mt: 2 }}>
                      Para mais de 3 horários, entre em contato conosco
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </List>

            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 9 - Acordos e Termos de Responsabilidade
              </Typography>
              <Grid container spacing={2}>
                {fieldsTermosAvisos.map(({ label, id }) => (
                  <Grid
                    item
                    xs={12}
                    key={id}
                    sx={{
                      padding: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: 1,
                        textAlign: "center",
                      }}
                    >
                      {label}
                    </Typography>
                    <RadioGroup
                      row
                      aria-labelledby={id}
                      {...register(id as keyof FormValuesStudent)}
                    >
                      {opcoesTermosAvisos[id.split(".")[2]].map(
                        (opcao, index) => (
                          <FormControlLabel
                            key={index}
                            value={opcao}
                            control={<Radio required />}
                            label={opcao}
                            sx={{
                              color: "#333",
                              marginRight: 2,
                              textAlign: "center",
                            }}
                          />
                        )
                      )}
                    </RadioGroup>
                  </Grid>
                ))}
              </Grid>
            </List>
            {avatarUrl === "" ? (
              <Button variant="contained" color="error" disabled>
                É necessário adicionar uma foto do atleta para concluir o
                cadastro!
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || isUploading || avatarUrl === ""}
              >
                {isSubmitting || isUploading
                  ? "Enviando dados, aguarde..."
                  : "Cadastrar Atleta"}
              </Button>
            )}
          </Box>
        </form>
      </Container>
    </Layout>
  );
}
