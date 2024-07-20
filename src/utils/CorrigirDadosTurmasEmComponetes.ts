import axios from 'axios';
export const CorrigirDadosDefinitivos = async () => {
    try {
      const modalidadesResponse = await axios.get('/api/obtermodalidades');
      const modalidades = modalidadesResponse.data;

      let corrigidosTotal = [];
      let duplicadosTotal = [];

      for (const modalidadeNome in modalidades) {
        const modalidade = modalidades[modalidadeNome];
        for (const turmaNome in modalidade.turmas) {
          const response = await axios.post('/api/ajustardadosdaturma', { modalidadeNome, turmaNome });
          const { corrigidos, duplicados } = response.data;

          if (corrigidos && corrigidos.length > 0) {
            corrigidosTotal.push(...corrigidos);
          }
          if (duplicados && duplicados.length > 0) {
            duplicadosTotal.push(...duplicados);
          }
        }
      }

    } catch (error) {
      console.error('Erro ao corrigir dados da turma:', error);
      
    }
  };