import axios from 'axios'

export const paysync = axios.create({
  baseURL: 'https://api.usepaysync.com/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.PAYSYNC_API_KEY}`
  }
})