//atualizado
"use client";
import {
  Modalidade,
  FormValuesStudent,
  ModalidadesData,
  AlunoPresencaUpdate,
  MoveStudentPayload,
  IIAlunoUpdate,
} from "../interface/interfaces";
import axios from "axios";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { useCallback } from 'react';
interface ChildrenProps {
  children: ReactNode;
}

interface DataContextType {
  ContextData: FormValuesStudent[];
  sendDataToApi: (data: FormValuesStudent) => Promise<void>;
  updateDataInApi: (data: IIAlunoUpdate) => Promise<void>;
  modalidades: Modalidade[]; // Adicione esta linha
  fetchModalidades: (filtro?: string) => Promise<Modalidade[]>; // Atualizado para re
  updateAttendanceInApi: (data: AlunoPresencaUpdate) => Promise<void>;
  moveStudentInApi: (payload: MoveStudentPayload) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  ContextData: [],
  sendDataToApi: async () => {},
  updateDataInApi: async () => {},
  modalidades: [],
  // Atualizar a implementação padrão para corresponder à nova assinatura
  fetchModalidades: async (filtro?: string): Promise<Modalidade[]> => {
    // Considerando que esta é uma implementação padrão, pode ser uma função vazia ou um mock.
    // Retorne uma promessa que resolve um array vazio ou um mock de modalidades, dependendo de suas necessidades de teste ou padrão.
    return [];
  },
  updateAttendanceInApi: async (data: AlunoPresencaUpdate) => {},
  moveStudentInApi: async (payload: MoveStudentPayload) => {
    console.warn("moveStudentInApi not implemented", payload);
  },
});

const useData = () => {
  const context = useContext(DataContext);
  return context;
};

const DataProvider: React.FC<ChildrenProps> = ({ children }) => {
  const [DataStudents, setDataStudents] = useState<FormValuesStudent[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  ///api/GetDataFirebase
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// buscar dados da api 
// Atualizar a função fetchModalidades para aceitar um parâmetro de filtro
// Dentro do seu DataProvider

const fetchModalidades = useCallback(async (filtro?: string): Promise<Modalidade[]> => {
  try {
    const url = filtro ? `/api/GetDataFirebase?modalidade=${filtro}` : '/api/GetDataFirebase';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha ao buscar modalidades');
    const data: ModalidadesData = await response.json();
    // Convertendo o objeto data para um array de modalidades
    const modalidadesArray: Modalidade[] = Object.entries(data).map(([nome, valor]) => ({
      nome,
      turmas: valor.turmas,
    }));
    setModalidades(modalidadesArray); // Atualiza o estado com todas as modalidades se necessário
    return modalidadesArray; // Retorna as modalidades filtradas
  } catch (error) {
    console.error("Erro ao buscar modalidades:", error);
    return []; // Retorna um array vazia em caso de erro
  }
}, []);

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// cadastrar novo estudante
const sendDataToApi = async (data: FormValuesStudent) => {
    try {
      const response = await axios.post("/api/SubmitFormRegistration", data);
      
      setDataStudents(response.data);
    } catch (error) {
      console.error("Ocorreu um erro ao enviar dados para a API:", error);
    }
  };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// atualizar informações pessoais do estudante
const updateDataInApi = async (data: IIAlunoUpdate ) => {
  const payload = {
    modalidade: data.modalidade,
    nomeDaTurma: data.nomeDaTurma,
    alunoId: data.alunoId, // Add alunoId here
    anoNascimento: data.anoNascimento,
    telefoneComWhatsapp: data.telefoneComWhatsapp,
    nome: data.nome,
    informacoesAdicionais: data.informacoesAdicionais,
  };

    try {
      const response = await fetch("/api/UpdatedataFirebase", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Lide com a resposta...
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const responseData = await response.json();
       
      }
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
    }
  };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// atualizar presenças do estudante
const updateAttendanceInApi = async (data: AlunoPresencaUpdate) => {
    try {
      // Formate os dados conforme necessário para a API
      const payload = {
        modalidade: data.modalidade,
        nomeDaTurma: data.nomeDaTurma,
        alunoNome: data.nome, // Certifique-se de ter um ID único para cada aluno
        presencas: data.presencas,
      };

      // Faça a chamada de API
      const response = await fetch("/api/updateAttendance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar dados de presença");
      }

      // Lide com a resposta da API
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
    }
  };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // trocar estudante de turma
  const moveStudentInApi = async (payload: MoveStudentPayload) => {
    try {
      const response = await fetch("/api/moveStudent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao mover aluno");
      }
  
      // O endpoint da API retorna os detalhes atualizados do aluno e as turmas afetadas
      const { alunoAtualizado, turmaOrigemAtualizada, turmaDestinoAtualizada } =
        await response.json();
  
      setModalidades((currentModalidades) => {
        const newModalidades = [...currentModalidades];
  
        // Encontrar e atualizar a turma de origem
        const modalidadeOrigem = newModalidades.find(m => m.nome === payload.modalidadeOrigem);
        const turmaOrigem = modalidadeOrigem?.turmas.find(t => t.nome_da_turma === payload.nomeDaTurmaOrigem);
        if (turmaOrigem && Array.isArray(turmaOrigem.alunos)) {
          const alunoIndex = turmaOrigem.alunos.findIndex(aluno => aluno && aluno.nome === payload.alunoNome);
          if (alunoIndex !== -1) {
            turmaOrigem.alunos.splice(alunoIndex, 1);
          }
        }
  
        // Encontrar e atualizar a turma de destino
        const modalidadeDestino = newModalidades.find(m => m.nome === payload.modalidadeDestino);
        const turmaDestino = modalidadeDestino?.turmas.find(t => t.nome_da_turma === payload.nomeDaTurmaDestino);
        if (turmaDestino && Array.isArray(turmaDestino.alunos)) {
          turmaDestino.alunos.push(alunoAtualizado);
        } else {
          // Se turmaDestino.alunos não for um array, inicializamos um com o alunoAtualizado
          turmaDestino!.alunos = [alunoAtualizado];
        }
  
        return newModalidades;
      });
    } catch (error) {
      console.error("Erro ao mover aluno:", error);
    }
  };
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  return (
    <DataContext.Provider
      value={{
        ContextData: DataStudents,
        sendDataToApi,
        updateDataInApi,
        modalidades,
        fetchModalidades,
        updateAttendanceInApi,
        moveStudentInApi,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataProvider, useData };
