import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const config = {
  DEBUG: true,
  boardSize: { rows: 3, cols: 3 },
  players: [ 'summer', 'winter' ], 
  trees: ['⋀', 'Y'] // ⋂ Ŧ ∀ ⨙ ξ ₸
}

function Tile({ value, ownedBy, onClick  }) {
  return (
    <button className={`tile ${ownedBy}`} onClick={onClick}>
      {value}
    </button>
  )
}

function Board({ tiles, onClick }) {
  const renderTile = (row, col) => {
    return (
      <Tile 
        value={tiles[row][col]?.value}
        ownedBy={tiles[row][col]?.ownedBy || ''}
        onClick={() => onClick(row,col)}
      />
    )
  }

  return (
    <div>
      {tiles.map((_, row) => {
        return (
          <div className="board-row">
            {tiles[row].map((_, col) => 
              renderTile(row, col)
            )}
          </div>
        )
      })}
    </div>
  )
}

function Palette({ trees, selectedTree, setSelectedTree }) {
  return trees.map((tree, i) => {
    return (
      <button 
        className={`tree ${selectedTree === i ? 'selected' : ''}`} 
        onClick={() => setSelectedTree(i)}>
        {tree}
      </button>
    )
  })
}

function Game({ boardSize, players, trees }) {
  const [ timeline, setTimeline ] = useState([{
    tiles: Array(boardSize.rows).fill(Array(boardSize.cols).fill(null)),
  }])
  const [ stepNumber, setStepNumber ] = useState(0)
  const [ currentPlayer, setCurrentPlayer ] = useState(0)
  const [ selectedTree, setSelectedTree ] = useState(0)

  const handleClick = (row,col) => {
    const history = timeline.slice(0, stepNumber + 1)
    const current = history[history.length - 1]
    const tiles = current.tiles.slice()
    if (calculateWinner(tiles) || tiles[row][col]) {
      return
    }
    tiles[row][col] = {
      value: trees[selectedTree],
      ownedBy: players[currentPlayer],
    }
    setTimeline(
      history.concat([{
        tiles: tiles,
      }])
    )
    setStepNumber(history.length)
    if (!calculateWinner(tiles)) {
      setCurrentPlayer((currentPlayer + 1) % players.length)
    }
  }
  
  const jumpTo = (step) => {
    setStepNumber(step)
    setCurrentPlayer(step % players.length)
  }

  const getMoves = () => {
    return timeline.map((step, move) => {
      const desc = move ? `Go to move #${move}` : `Go to game start`
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
      )
    })
  }

  const getStatus = () => {
    const current = timeline[stepNumber]
    const winner = calculateWinner(current.tiles)

    if (winner) {
      return `Winner: ${players[currentPlayer]}`
    }
    if (!current.tiles.includes(null)) {
      return 'Draw'
    }
    return (
      <div>
        {`Current player: ${players[currentPlayer]}`}
        <br />
        {`Current tree: ${trees[selectedTree]}`}
      </div>
    )
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board 
          tiles={timeline[stepNumber].tiles}
          onClick={handleClick}
        />
      </div>
      <div className="game-info">
        <div>{getStatus()}</div>
        <Palette
          trees={trees}
          selectedTree={selectedTree}
          setSelectedTree={setSelectedTree}
        />
        {config.DEBUG ? <ol>{getMoves()}</ol> : null}
      </div>
    </div>
  )
}

// ========================================

ReactDOM.render(
  <Game
    boardSize={config.boardSize}
    players={config.players}
    trees={config.trees}
  />,
  document.getElementById('root')
)

function calculateWinner(tiles) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    let aVal = tiles[a]?.value
    if (aVal && aVal === tiles[b]?.value && aVal === tiles[c]?.value) {
      return tiles[a].ownedBy
    }
  }
  return null
}
