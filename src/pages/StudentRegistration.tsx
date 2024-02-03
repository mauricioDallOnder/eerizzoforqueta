import { useForm, SubmitHandler } from "react-hook-form";
import { FormValuesStudent, Turma } from "@/interface/interfaces";
import { useEffect, useState } from "react";
import {
  extrairDiaDaSemana,
  fieldsDadosGeraisAtleta,
  fieldsEndereco,
  fieldsIdentificacao,
  fieldsResponsavelMensalidade,
  fieldsTermosAvisos,
  gerarPresencasParaAluno,
  opcoesTermosAvisos,
  vinculosempresasparceiras,
} from "@/utils/Constants";
import {
  Avatar,
  Box,
  Button,
  Container,
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
export default function StudentRegistration() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormValuesStudent>();
  const { modalidades, fetchModalidades, sendDataToApi } = useData(); // Usando o hook useData
  const [selectedNucleo, setSelectedNucleo] = useState<string>("");
  const [nucleosDisponiveis, setNucleosDisponiveis] = useState<string[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<Turma[]>([]);
  useEffect(() => {
    fetchModalidades();
  }, [fetchModalidades]);

  //upload de imagem-------------------------------------------------------------------------------------------------------
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState({
    aspect: 512 / 768,
    width: 512,
    height: 768,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    try {
      const resizedImageUrl = await resizeImage(file);
      setFile(
        new File([await (await fetch(resizedImageUrl)).blob()], file.name)
      );
      setAvatarUrl(resizedImageUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const removeImage = () => {
    setFile(null);
    setAvatarUrl("");
  };
  //----------------------------------------------------------------------------------------------

  const selectedModalidade = watch("modalidade");
  //const selectedTurma = watch('turmaSelecionada');

  const getNucleosForModalidade = (modalidade: string) => {
    const turmas = modalidades.find((m) => m.nome === modalidade)?.turmas;
    if (!turmas) return [];
    const nucleos = new Set(turmas.map((turma) => turma.nucleo));
    return Array.from(nucleos);
  };

  useEffect(() => {
    const nucleos = getNucleosForModalidade(selectedModalidade);
    setNucleosDisponiveis(nucleos);
    setSelectedNucleo("");
  }, [selectedModalidade]);

  useEffect(() => {
    const turmasFiltradas = modalidades
      .find((m) => m.nome === selectedModalidade)
      ?.turmas.filter((turma) => turma.nucleo === selectedNucleo);
    setTurmasDisponiveis(turmasFiltradas || []);
  }, [selectedNucleo, modalidades, selectedModalidade]);

  const onSubmit: SubmitHandler<FormValuesStudent> = async (data) => {
    const diaDaSemana = extrairDiaDaSemana(data.turmaSelecionada);
    data.aluno.presencas = gerarPresencasParaAluno(diaDaSemana);

    const turmaEscolhida = modalidades
      .find((m) => m.nome === data.modalidade)
      ?.turmas.find((t) => t.nome_da_turma === data.turmaSelecionada);

    if (
      turmaEscolhida &&
      turmaEscolhida.capacidade_atual_da_turma <
        turmaEscolhida.capacidade_maxima_da_turma
    ) {
      if (file) {
        setIsUploading(true);
        const fileName = uuidv4() + file.name;
        const fileRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Compute and update the progress
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            // Handle unsuccessful uploads
            console.log(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(fileRef);
            setAvatarUrl(downloadURL);
            await sendDataToApi(data);
            setValue("modalidade", "");
            setValue("turmaSelecionada", "");
            setSelectedNucleo("");
            setTurmasDisponiveis([]);
            setIsUploading(false); // reset after successful upload
            setAvatarUrl(""); // reset avatar url after successful upload
            alert("Aluno Cadastrado com sucesso");
          }
        );
      }
    } else {
      alert(
        "Não há vagas disponíveis na turma selecionada. Por favor, escolha outra turma."
      );
    }
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
                      id={id}
                      label={label}
                      variant="standard"
                      sx={{
                        borderRadius: "4px",
                      }}
                      required
                      {...register(id as keyof FormValuesStudent)} // asserção de tipo aqui
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
                      {...register(id as keyof FormValuesStudent)} // asserção de tipo aqui
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
                      {...register(id as keyof FormValuesStudent)} // asserção de tipo aqui
                    />
                  </Grid>
                ))}
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
                {/* Campo para selecionar a modalidade */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    required
                    label="Modalidade"
                    {...register("modalidade")}
                    fullWidth
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  >
                    {[
                      { value: "futebol", label: "futebol" },
                      { value: "futsal", label: "futsal" },
                      { value: "volei", label: "volei" },
                      
                    ].map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Campo para selecionar o núcleo */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Local de treinamento"
                    value={selectedNucleo ? selectedNucleo : ""}
                    onChange={(event) =>
                      setSelectedNucleo(event.target.value as string)
                    }
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  >
                    {nucleosDisponiveis.map((nucleo) => (
                      <MenuItem key={nucleo} value={nucleo}>
                        {nucleo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Campo para selecionar a turma */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Turma"
                    {...register("turmaSelecionada")}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  >
                    {turmasDisponiveis.map((turma) => (
                      <MenuItem
                        key={turma.nome_da_turma}
                        value={turma.nome_da_turma}
                      >
                        {turma.nome_da_turma}
                      </MenuItem>
                    ))}
                  </TextField>
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
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Enviando dados,aguarde..." : "Cadastrar Atleta"}
            </Button>
          </Box>
        </form>
      </Container>
    </Layout>
  );
}
