import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
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

export default function RelatorioVisual({ dados }) {
  return (
    <div className={styles.relatorio}>
      <h4 className={styles.titulo}>📊 {dados.titulo}</h4>
      <p className={styles.periodo}>{dados.periodo}</p>

      <div className={styles.kpis}>
        {dados.kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <span className={styles.kpiValor}>{k.valor}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
          </div>
        ))}
      </div>

      <p className={styles.graficoTitulo}>Temperatura e umidade</p>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={dados.clima} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="hora" tick={eixo} />
          <YAxis tick={eixo} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line type="monotone" dataKey="temperatura" name="Temp. (°C)" stroke="#00e5ff" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="umidade" name="Umidade (%)" stroke="#a259f7" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>

      <p className={styles.graficoTitulo}>Chuva por dia (mm)</p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={dados.chuva} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="dia" tick={eixo} />
          <YAxis tick={eixo} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,229,255,0.08)' }} />
          <Bar dataKey="mm" name="Chuva (mm)" fill="#00b9d6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}