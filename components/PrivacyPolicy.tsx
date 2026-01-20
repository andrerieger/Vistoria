import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-10 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-slate-100 text-lg">Política de Privacidade</h1>
      </nav>

      <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">
        
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">VistoriLar</h2>
            <p className="text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-4">
                A sua privacidade é importante para nós. É política do VistoriLar respeitar a sua privacidade em relação a qualquer informação que possamos coletar no aplicativo VistoriLar.
            </p>
        </div>

        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Eye className="text-amber-500" size={24} /> 1. Informações que Coletamos
            </h3>
            <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Coletamos:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-amber-500">
                <li><strong>Dados de Conta:</strong> Nome, e-mail, telefone e número de CRECI (opcional) para criação de perfil e identificação nos laudos.</li>
                <li><strong>Dados de Vistorias:</strong> Endereços, nomes de clientes, descrições de imóveis, leituras de medidores e inventário de chaves.</li>
                <li><strong>Mídia:</strong> Fotos capturadas ou enviadas durante a vistoria para compor o laudo técnico.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Server className="text-amber-500" size={24} /> 2. Uso e Armazenamento de Dados
            </h3>
            <p>
                Os dados são armazenados em serviços de nuvem seguros (Supabase) e retidos pelo tempo necessário para fornecer o serviço solicitado ou até que você solicite a exclusão.
            </p>
            <ul className="list-disc pl-5 space-y-2 marker:text-amber-500">
                <li>Utilizamos os dados para gerar os documentos PDF das vistorias.</li>
                <li>Utilizamos Inteligência Artificial (Google Gemini) para processar imagens e melhorar descrições, mas não utilizamos seus dados para treinar modelos públicos sem consentimento.</li>
                <li>Protegemos os dados armazenados dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Lock className="text-amber-500" size={24} /> 3. Compartilhamento de Informações
            </h3>
            <p>
                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
            </p>
            <p>
                Os laudos em PDF gerados podem ser compartilhados por você (usuário) com seus clientes através de links públicos gerados pela plataforma. Você tem total controle sobre a disseminação desses links.
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Shield className="text-amber-500" size={24} /> 4. Seus Direitos
            </h3>
            <p>
                Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
            </p>
            <p>
                Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações do aplicativo ("Configurações de Perfil" {'>'} "Zona de Perigo").
            </p>
        </section>
        
        <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <FileText className="text-amber-500" size={24} /> 5. Termos de Uso
            </h3>
            <p>
                O uso continuado de nosso aplicativo será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais. Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco.
            </p>
        </section>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>Contato: andreriegerso@gmail.com</p>
            <p className="mt-2">VistoriLar © {new Date().getFullYear()}</p>
        </div>

      </div>
    </div>
  );
};