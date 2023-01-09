import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const config = {
  DEBUG: true,
  boardSize: { x: 3, y: 3 },
  players: [ 'green', 'blue' ], 
  trees: ['⋀', '⋂'], 
}

function Tile({ value, ownedBy, onClick  }) {
  return (
    <button className={`tile ${ownedBy}`} onClick={onClick}>
      {value}
    </button>
  )
}

function Board({ tiles, onClick }) {
  const renderTile = (i) => {
    return (
      <Tile 
        value={tiles[i]?.value}
        ownedBy={tiles[i]?.ownedBy || ''}
        onClick={() => onClick(i)}
      />
    )
  }

  return (
    <div>
      <div className="board-row">
        {renderTile(0)}
        {renderTile(1)}
        {renderTile(2)}
      </div>
      <div className="board-row">
        {renderTile(3)}
        {renderTile(4)}
        {renderTile(5)}
      </div>
      <div className="board-row">
        {renderTile(6)}
        {renderTile(7)}
        {renderTile(8)}
      </div>
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
    tiles: Array(9).fill(null),
  }])
  const [ stepNumber, setStepNumber ] = useState(0)
  const [ currentPlayer, setCurrentPlayer ] = useState(0)
  const [ selectedTree, setSelectedTree ] = useState(0)

  const handleClick = (i) => {
    const history = timeline.slice(0, stepNumber + 1)
    const current = history[history.length - 1]
    const tiles = current.tiles.slice()
    if (calculateWinner(tiles) || tiles[i]) {
      return
    }
    tiles[i] = {
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
      const desc = move ?
        `Go to move #${move}` :
        `Go to game start`
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
          onClick={(i) => handleClick(i)}
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
