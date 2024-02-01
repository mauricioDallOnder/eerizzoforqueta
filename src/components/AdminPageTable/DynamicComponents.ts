// Em algum arquivo de componente, por exemplo, DynamicComponents.js

import dynamic from 'next/dynamic';



export const AdminTableInfoNoSSR = dynamic(() => import('./AdminInfoTable'), {
    ssr: false,
});

export const ControleFrequenciaTableNoSSR = dynamic(() => import('./ControleFrequenciaTable'), {
    ssr: false,
});

export const TurmasInfoTableNoSSR = dynamic(() => import('./TurmasInfoTable'), {
    ssr: false,
});
