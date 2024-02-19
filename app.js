const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')

const { validateMovie, validatePartialMovie } = require('./movies')

const PORT = process.env.PORT ?? 1234

const app = express()
app.disable('x-powered-by')

app.use(express.json())

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) =>{
  res.header('Access-Control-Allow-Origin', '*')
  const {genre} = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() == genre.toLowerCase())
    )
    return res.json(filteredMovies)

  } else{
    return res.json(movies)
  }
 
})

app.get('/movies/:id', (req, res) =>{
  const {id} = req.params
  const movie = movies.find(movie => movie.id == id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'movie not found'})
}
)

app.post('/movies', (req, res) =>{
  
  const result = validateMovie(req.body)

  if (result.error){
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }

  const newMovie = {
    id: crypto.randomUUID(),
   ...result.data
  }
  
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) =>{
  const result = validatePartialMovie(req.body)

  if (result.error){
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }
  const {id} = req.params
  const movieIndex = movies.findIndex(movie => movie.id == id)

    if(movieIndex == -1) return res.status(404).json({message: "Movie not found"})

    const updateMovie = {
      ...movies[movieIndex],
      ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
}
)

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`)
})