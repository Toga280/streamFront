import { useEffect, useState, useRef } from 'react'
import './App.css'

type PlayerData = {
  id: number
  name: string
  life: number
  maxLife: number
}

function LifeBar({
  life,
  name,
  align,
  maxLife,
}: {
  life: number
  maxLife: number
  name: string
  align: 'left' | 'right'
}) {
  const filledBars = Math.max(0, Math.min(life, maxLife))
  const bars = Array.from({ length: maxLife }, (_, i) => i < filledBars)

  return (
    <div className={`life-bar-container ${align}`}>
      {align === 'left' ? (
        <>
          <span className='player-name'>{name}</span>
          <div className='bars left'>
            {bars.map((isAlive, index) => (
              <div
                key={index}
                className={`bar-segment ${isAlive ? 'alive' : 'dead'}`}
              ></div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className='bars right'>
            {bars.map((isAlive, index) => (
              <div
                key={index}
                className={`bar-segment ${isAlive ? 'alive' : 'dead'}`}
              ></div>
            ))}
          </div>
          <span className='player-name'>{name}</span>
        </>
      )}
    </div>
  )
}

function App() {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://stream-952533578754.europe-west1.run.app/')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setError(null)
      ws.send(JSON.stringify({ type: 'getPlayerByName', name: 'Artishow' }))
      ws.send(JSON.stringify({ type: 'getPlayerByName', name: 'Togra' }))
    }

    ws.onmessage = (event) => {
      console.log('WS received:', event.data)
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'playerData') {
          setPlayers((prevPlayers) => {
            const playerIndex = prevPlayers.findIndex(
              (p) => p.id === data.player.id
            )
            if (playerIndex !== -1) {
              const updatedPlayers = [...prevPlayers]
              updatedPlayers[playerIndex] = data.player
              return updatedPlayers
            } else {
              return [...prevPlayers, data.player]
            }
          })
          setLoading(false)
          setError(null)
        } else if (data.type === 'error') {
          setError(data.message)
          setLoading(false)
        }
      } catch (e) {
        console.error('Invalid WS message:', e)
        setError('Erreur de format WebSocket')
        setLoading(false)
      }
    }

    ws.onerror = (event) => {
      console.error('WebSocket error event:', event)
    }

    ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason)
      if (event.code !== 1000) {
        setError('Connexion WebSocket interrompue')
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className='App'>
      <header className='App-header'>
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && players.length > 0 && (
          <div className='players-bar'>
            {players.map((player, index) => (
              <LifeBar
                key={player.id}
                name={player.name}
                life={player.life}
                maxLife={player.maxLife}
                align={index === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        )}
      </header>
    </div>
  )
}

export default App
