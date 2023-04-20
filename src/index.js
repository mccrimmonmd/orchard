import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const config = {
  DEBUG: true,
  boardSize: { rows: 5, cols: 5 },
  players: [ 'summer', 'winter' ], 
  trees: ['⋀', 'Y',], // '⋂', 'Ŧ', '∀', '⨙', 'ξ', '₸',
  treeNames: ['oak', 'elm'],
  ages: ['.', ':'],
}

const showAge = (tree) =>
  tree && (config.ages[tree.age] || tree.value)

function Tile({ tree, ownedBy, currentPlayer, clickHandler }) {
  return (
    <button className={`tile ${ownedBy}`} onClick={clickHandler}>
      {ownedBy === currentPlayer ? tree?.value : showAge(tree)}
    </button>
  )
}

function Board({ tiles, currentPlayer, getClickHandler }) {
  return (
    <div>
      {tiles.map((_, row) => {
        return (
          <div key={row} className="board-row">
            {tiles[row].map((_, col) => {
              let ownedBy = tiles[row][col]?.ownedBy || ''
              return (
                <Tile 
                  key={row + '.' + col}
                  tree={tiles[row][col]?.tree}
                  ownedBy={ownedBy}
                  currentPlayer={currentPlayer}
                  clickHandler={getClickHandler(row, col)}
                />
              )}
            )}
          </div>
        )
      })}
    </div>
  )
}

function Palette({ selectedTree, setSelectedTree }) {
  return config.trees.map((tree, i) => {
    return (
      <button 
        key={tree}
        className={`tree ${selectedTree === i ? 'selected' : ''}`} 
        onClick={() => setSelectedTree(i)}>
        {tree}
      </button>
    )
  })
}

const emptyBoard = () => {
  return Array(config.boardSize.rows).fill(null)
    .map(() => Array(config.boardSize.cols).fill(null))
}

const timestep = (currentState) => {
  let tiles = emptyBoard()
  currentState.tiles.forEach((_, row) => {
    currentState.tiles[row].forEach((tile, col) => {
      if (tile) {
        let tree = {...tile.tree}
        tree.age += 1
        tiles[row][col] = { 
          ...tile,
          tree
        }
      }
    })
  })
  return { tiles }
}

function Game({ players }) {
  const [ timeline, setTimeline ] = useState(
    [{ tiles: emptyBoard() }]
  )
  const [ stepNumber, setStepNumber ] = useState(0)
  const [ currentPlayer, setCurrentPlayer ] = useState(0)
  const [ selectedTree, setSelectedTree ] = useState(0)

  const getClickHandler = (row , col) => () => {
    const history = timeline.slice(0, stepNumber + 1)
    const current = timestep(history[history.length - 1])
    const tiles = current.tiles
    if (calculateWinner(tiles) || tiles[row][col]) {
      return
    }
    tiles[row][col] = {
      tree: {
        value: config.trees[selectedTree],
        name: config.treeNames[selectedTree],
        age: 0,
      },
      ownedBy: players[currentPlayer],
    }
    setTimeline(
      history.concat([{
        tiles: tiles,
      }])
    )
    console.log(timeline)
    setStepNumber(history.length)
    if (!calculateWinner(tiles)) {
      setCurrentPlayer((currentPlayer + 1) % players.length)
    }
  }
  
  const jumpTo = (step) => {
    setStepNumber(step)
    setCurrentPlayer(step % players.length)
  }

  const moves = timeline.map((_, move) => {
    const desc = move ? `Go to move #${move}` : `Go to game start`
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    )
  })

  const isDraw = (rows) => {
    // full board
    return rows.every(col => col.every(tile => tile != null))
  }

  const getStatus = () => {
    const current = timeline[stepNumber]
    const winner = calculateWinner(current.tiles)

    if (winner) {
      return `Winner: ${players[currentPlayer]}`
    }
    if (isDraw(current.tiles)) {
      return 'Draw'
    }
    return (
      <div>
        {`Current player: ${players[currentPlayer]}`}
        <br />
        {`Current tree: ${config.trees[selectedTree]}`}
      </div>
    )
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board 
          tiles={timeline[stepNumber].tiles}
          currentPlayer={currentPlayer}
          getClickHandler={getClickHandler}
        />
      </div>
      <div className="game-info">
        <div>{getStatus()}</div>
        <div>{stepNumber}</div>
        <Palette
          selectedTree={selectedTree}
          setSelectedTree={setSelectedTree}
        />
        {config.DEBUG ? <ol>{moves}</ol> : null}
      </div>
    </div>
  )
}

// ========================================

ReactDOM.render(
  <Game
    players={config.players}
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
