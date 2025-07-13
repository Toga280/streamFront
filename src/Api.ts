import axios from 'axios'

//const API_BASE_URL = 'https://stream-952533578754.europe-west1.run.app'
const API_BASE_URL = 'http://localhost:3000'

type PlayerData = {
  id: number
  name: string
  life: number
}

function getPlayer(playerName: string): Promise<PlayerData | string> {
  return axios
    .get<PlayerData>(`${API_BASE_URL}/api/player/${playerName}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error('Erreur API:', error)
      return `Erreur lors de la récupération des données : ${
        error.message || error
      }`
    })
}

export default getPlayer
