import React, { useCallback, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    TextField,
    Button,
    Box,
    Typography,
    Modal,
    Checkbox,
    FormLabel,
    FormControlLabel,
} from "@mui/material";
import { DataContext } from "@/context/context";
import { IIAvisos, Modalidade } from "@/interface/interfaces";
import { BoxStyleCadastro } from "@/utils/Styles";

export function Avisos({
    alunoNome,
    nomeDaTurma,
    modalidade,
}: {
    alunoNome: string;
    nomeDaTurma: string;
    modalidade: string;
}) {
    const { modalidades, fetchModalidades, avisoStudent } = useContext(DataContext);
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<IIAvisos>();
    const [open, setOpen] = useState<boolean>(false);
    const [modalidadesOptions, setModalidadesOptions] = useState<Modalidade[]>([]);
    const [checkedAvisoTrue, setcheckedAvisoTrue] = useState<boolean>(false);
    const [avisoExists, setAvisoExists] = useState<boolean>(true);

    const verificaAviso = watch("IsActive");
    const dataavisoWatch = watch("dataaviso");

    useEffect(() => {
        if (open) {
            setValue('alunoNome', alunoNome);
            setValue('nomeDaTurma', nomeDaTurma);
            setValue('modalidade', modalidade);
            checkExistingAviso(); // Checa se o aviso já existe quando o modal é aberto
        }
    }, [open, alunoNome, nomeDaTurma, modalidade, setValue]);

    useEffect(() => {
        fetchModalidades().catch(console.error);
    }, [fetchModalidades]);

    useEffect(() => {
        setModalidadesOptions(modalidades);
    }, [modalidades]);

    useEffect(() => {
        if (verificaAviso !== undefined) {
            setcheckedAvisoTrue(verificaAviso);
        }
    }, [verificaAviso]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setcheckedAvisoTrue(event.target.checked);
        setValue('IsActive', event.target.checked);
    };

    const checkExistingAviso = async () => {
        try {
            const response = await fetch('/api/checkAvisoInDatabase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ alunoNome, nomeDaTurma, modalidade }),
            });
    
            if (response.status === 404) {
                setAvisoExists(false);
            } else if (!response.ok) {
                throw new Error('Erro ao verificar aviso');
            } else {
                const existingAviso = await response.json();
                setAvisoExists(true);
                setValue('textaviso', existingAviso.textaviso);
                const date = new Date(existingAviso.dataaviso);
                if (!isNaN(date.getTime())) {
                    setValue('dataaviso', date);
                }
                setValue('IsActive', existingAviso.IsActive);
            }
        } catch (error) {
            console.error('Erro ao verificar aviso:', error);
        }
    };
    useEffect(() => {
        console.log('Estado de avisoExists:', avisoExists);
    }, [avisoExists]);
        

    const onSubmit: SubmitHandler<IIAvisos> = useCallback(
        async (data) => {
            try {
                // Certifique-se de que dataaviso é um objeto Date
                const dataavisoDate = new Date(data.dataaviso);
                if (isNaN(dataavisoDate.getTime())) {
                    throw new Error('Data inválida fornecida');
                }

                const payload: IIAvisos = {
                    alunoNome: data.alunoNome,
                    modalidade: data.modalidade,
                    nomeDaTurma: data.nomeDaTurma,
                    textaviso: data.textaviso,
                    dataaviso: dataavisoDate, // Passe como um Date
                    IsActive: data.IsActive
                };

                if (avisoExists) {
                    await avisoStudent(payload, 'PUT');
                    alert("Aviso atualizado com sucesso");
                } else {
                    await avisoStudent(payload, 'POST');
                    alert("Aviso criado com sucesso");
                }
                reset();
                setOpen(false);
            } catch (error) {
                console.error("Erro ao processar aviso", error);
                alert("Erro ao processar aviso.");
            }
        },
        [avisoStudent, reset, avisoExists, modalidade, nomeDaTurma, watch]
    );

    const handleDelete = async () => {
        try {
            await avisoStudent({
                alunoNome, nomeDaTurma, modalidade,
                textaviso: "",
                dataaviso: new Date(), // Passe um Date válido
                IsActive: false
            }, 'DELETE');
            alert("Aviso deletado com sucesso");
            reset();
            setOpen(false);
        } catch (error) {
            console.error("Erro ao deletar aviso", error);
            alert("Erro ao deletar aviso.");
        }
    };

    return (
        <>
            <Button variant="contained" color="warning" onClick={() => setOpen(true)}>
                Avisos
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={BoxStyleCadastro}
                >
                    <Typography
                        variant="h6"
                        sx={{ color: "black", fontWeight: "bold", textAlign: "center" }}
                    >
                        {avisoExists ? "EDITAR AVISO" : "CRIAR AVISO"}
                    </Typography>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Nome"
                        value={alunoNome}
                        {...register("alunoNome")}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        {...register("modalidade")}
                        label="Modalidade de Origem(não alterar!)"
                        value={modalidade}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        {...register("nomeDaTurma")}
                        label="Turma de Origem(não alterar!)"
                        value={nomeDaTurma}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Texto do aviso"
                        {...register("textaviso")}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        {...register("dataaviso")}
                        type="date"
                        label="Data de expiração do aviso"
                        InputLabelProps={{ shrink: true }}
                        value={
                            dataavisoWatch && !isNaN(new Date(dataavisoWatch).getTime())
                                ? new Date(dataavisoWatch).toISOString().split('T')[0]
                                : ''
                        }
                        onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (!isNaN(selectedDate.getTime())) {
                                setValue('dataaviso', selectedDate); // Converte para Date apenas se for válido
                            } else {
                                console.error('Data inválida selecionada:', e.target.value);
                            }
                        }}
                    />

                    <FormLabel>Ativar/Desativar Aviso</FormLabel>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={checkedAvisoTrue}
                                onChange={handleCheckboxChange}
                            />
                        }
                        label={checkedAvisoTrue ? "Aviso ativado" : "Aviso desativado"}
                        sx={{ color: "black" }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? "Processando..." : avisoExists ? "Atualizar Aviso" : "Criar Aviso"}
                        </Button>
                        {avisoExists && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                Deletar Aviso
                            </Button>
                        )}
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

interface IIAvisosProps {
    alunoNome: string;
    nomeDaTurma: string;
    modalidade: string;
}
function areEqual(
    prevProps: IIAvisosProps,
    nextProps: IIAvisosProps
) {
    return (
        prevProps.alunoNome === nextProps.alunoNome &&
        prevProps.nomeDaTurma === nextProps.nomeDaTurma &&
        prevProps.modalidade === nextProps.modalidade
    );
}

export const AvisoStudents = React.memo(Avisos, areEqual);
