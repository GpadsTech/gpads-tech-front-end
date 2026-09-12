//criar efeito meia-lua
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

function Gauge({ titulo, valor, min, max, cor, unidade})
{
    //sempre preenche metade do arco
    const percentual = (valor - min) / (max - min) * 100
    console.log('Gauge aplicado')
    return(
        <div>
            <p style={{ 
            textAlign: 'center', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#555', 
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
            }}>
            {titulo}
            </p>
            <div style={{position: 'relative', width: 265, height: 250}}>
            <RadialBarChart
            //tamanho do grafico
            width={280}
            height={145}
            //centro do arco
            cx={140}
            cy={170}
            //espessura do arco
            innerRadius={65}
            outerRadius={150}
            //onde o arco começa e termina
            startAngle={180}
            endAngle={0}
            //valor que o arco vai preencher.Nesse caso, metade dele
            data={[{ value: percentual, fundo:100}]}
            >
            
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false}/>
            <RadialBar  dataKey="value" fill={cor} background={{fill: '#e8e8e8'}}/>
            </RadialBarChart>
            <div style={{ 
            position: 'absolute', 
            bottom: 100, 
            width: '100%', 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            fontWeight: '700',
            color: cor
            }}>
            {valor} {unidade}
            </div>
            <span style={{ position: 'absolute', bottom: 80, left: 5, fontSize: '0.75rem', color: '#999' }}>{min}</span>
            <span style={{ position: 'absolute', bottom: 80, right: 5, fontSize: '0.75rem', color: '#999' }}>{max}</span>
        </div>


        </div>

        
    )
}

export default Gauge