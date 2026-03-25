import { Link } from 'react-router-dom'

export default function Privacidade() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
          <span>/</span>
          <span className="text-gray-400">Política de Privacidade</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm">Última atualização: março de 2026</p>
      </div>
      <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-6 sm:p-8">
        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Introdução</h2>
            <p>O CalcTrabalhista respeita a privacidade dos seus usuários e está comprometido com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Dados que coletamos</h2>
            <p className="mb-2"><strong className="text-white">O CalcTrabalhista NÃO coleta, armazena ou transmite dados pessoais.</strong></p>
            <p className="mb-2">Todos os cálculos são realizados localmente no seu navegador (client-side). Os valores que você insere nas calculadoras (salário, datas, etc.) não são enviados para nenhum servidor e não são armazenados de nenhuma forma.</p>
            <p>Não solicitamos nome, e-mail, CPF, telefone ou qualquer dado de identificação pessoal para o uso das calculadoras gratuitas.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Cookies e tecnologias de rastreamento</h2>
            <p className="mb-2">O site pode utilizar as seguintes tecnologias:</p>
            <p className="mb-1"><strong className="text-white">Google Analytics:</strong> para coletar dados anônimos de navegação (páginas visitadas, tempo de permanência, tipo de dispositivo). Estes dados não identificam o usuário individualmente.</p>
            <p><strong className="text-white">Google AdSense:</strong> pode exibir anúncios personalizados com base em cookies geridos pelo Google. Você pode gerenciar suas preferências nas <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Configurações de Anúncios do Google</a>.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Compartilhamento de dados</h2>
            <p>Não compartilhamos, vendemos ou transferimos dados pessoais a terceiros. Os únicos serviços de terceiros integrados ao site são o Google Analytics e o Google AdSense, que possuem suas próprias políticas de privacidade.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Seus direitos (LGPD)</h2>
            <p className="mb-2">Como não coletamos dados pessoais identificáveis, a maioria dos direitos previstos na LGPD não se aplica diretamente. Em relação aos cookies de terceiros, você tem o direito de:</p>
            <p className="mb-1">• Desativar cookies no seu navegador</p>
            <p className="mb-1">• Optar por não receber anúncios personalizados</p>
            <p>• Solicitar informações sobre o tratamento de dados</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Segurança</h2>
            <p>O site utiliza protocolo HTTPS para garantir a segurança da conexão. Como não armazenamos dados pessoais, o risco de vazamento de informações sensíveis é inexistente.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Alterações nesta política</h2>
            <p>Esta política pode ser atualizada periodicamente. Quaisquer alterações serão publicadas nesta página com a data de atualização revisada.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Contato</h2>
            <p>Se tiver dúvidas sobre esta Política de Privacidade, entre em contato através do e-mail: <span className="text-emerald-400">contato@calctrabalhista.com.br</span></p>
          </section>
        </div>
      </div>
    </div>
  )
}
