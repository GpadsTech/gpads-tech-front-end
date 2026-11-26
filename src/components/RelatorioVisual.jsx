import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import styles from './RelatorioVisual.module.css';

const eixo = { fontSize: 10, fill: 'rgba(255,255,255,0.5)' };
const tooltipStyle = {
  backgroundColor: 'rgba(3, 14, 30, 0.95)',
  border: '1px solid rgba(0, 217, 235, 0.5)',
  borderRadius: '8px',
  fontSize: 11,
  color: '#fff',
};

const VARIAVEIS_POR_TIPO = {
  estacao: [
    { key: 'temperatura', nome: 'Temperatura', unidade: '°C', cor: '#00e5ff' },
    { key: 'umidade', nome: 'Umidade', unidade: '%', cor: '#a259f7' },
    { key: 'pressao', nome: 'Pressão', unidade: '', cor: '#00b9d6' },
    { key: 'vento', nome: 'Vento', unidade: '', cor: '#2B6F6F' },
    { key: 'rpm', nome: 'RPM', unidade: 'RPM', cor: '#8D99AE' },
    { key: 'luz', nome: 'Luminosidade', unidade: '', cor: '#f5a623' },
    { key: 'ar', nome: 'Qualidade do ar', unidade: '', cor: '#c084fc' },
    { key: 'gas', nome: 'Gás', unidade: '', cor: '#a1c298' },
    { key: 'volt', nome: 'Tensão Elétrica', unidade: 'V', cor: '#38bdf8' },
  ],
  boia: [
    { key: 'ph', nome: 'pH', unidade: '', cor: '#00e5ff' },
    { key: 'turbidez_ntu', nome: 'Turbidez', unidade: 'NTU', cor: '#557db4' },
    { key: 'sensor_uv_v', nome: 'Sensor UV', unidade: 'V', cor: '#f5a623' },
    { key: 'adc', nome: 'ADC', unidade: '', cor: '#9b6cbb' },
  ],
};

function formatarHora(hora) {
  if (!hora) return '';
  const partes = String(hora).split(' ');
  return partes.length >= 2 ? partes[1].substring(0, 5) : hora;
}

export default function RelatorioVisual({ dados }) {
  if (!dados) return null;

  const tipo = dados.tipo?.toLowerCase() || '';
  const variaveisConfig = VARIAVEIS_POR_TIPO[tipo] || [];
  const series = Array.isArray(dados.series) ? dados.series : [];
  const kpisReais = Array.isArray(dados.kpis) ? dados.kpis : [];

  // Filtra apenas variáveis próprias do equipamento que realmente possuem dados no período
  const variaveisComDados = variaveisConfig.filter((v) =>
    series.some((item) => item[v.key] !== undefined && item[v.key] !== null)
  );

  const dadosGrafico = series.map((item) => ({
    ...item,
    horaFormatada: formatarHora(item.hora),
  }));

  return (
    <div className={styles.relatorio}>
      <h4 className={styles.titulo}>{dados.titulo || 'Relatório de Medições'}</h4>
      {dados.periodo && <p className={styles.periodo}>{dados.periodo}</p>}

      {kpisReais.length > 0 && (
        <div className={styles.kpis}>
          {kpisReais.map((k) => (
            <div key={k.label} className={styles.kpi}>
              <span className={styles.kpiValor}>{k.valor}</span>
              <span className={styles.kpiLabel}>{k.label}</span>
            </div>
          ))}
        </div>
      )}

      {variaveisComDados.length === 0 ? (
        <p className={styles.periodo}>
          Nenhum registro real disponível para as variáveis deste equipamento no período aplicado.
        </p>
      ) : (
        variaveisComDados.map((v) => (
          <div key={v.key}>
            <p className={styles.graficoTitulo}>
              {v.nome} {v.unidade ? `(${v.unidade})` : ''}
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={dadosGrafico} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="horaFormatada" tick={eixo} />
                <YAxis tick={eixo} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey={v.key}
                  name={v.unidade ? `${v.nome} (${v.unidade})` : v.nome}
                  stroke={v.cor}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))
      )}
    </div>
  );
}