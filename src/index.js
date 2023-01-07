import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Tile({ value, onClick }) {
  return (
    <button className="tile" onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ tiles, onClick }) {
  const renderTile = (i) => {
    return (
      <Tile 
        value={tiles[i]}
        onClick={() => onClick(i)}
      />
    );
  };

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
  );
}

function Game(props) {
  const [ timeline, setTimeline ] = useState([{
    tiles: Array(9).fill(null),
  }]);
  const [ stepNumber, setStepNumber ] = useState(0);
  const [ xIsNext, setXIsNext ] = useState(true);

  const handleClick = (i) => {
    const history = timeline.slice(0, stepNumber + 1);
    const current = history[history.length - 1];
    const tiles = current.tiles.slice();
    if (calculateWinner(tiles) || tiles[i]) {
      return;
    }
    tiles[i] = xIsNext ? 'X' : 'O';
    setTimeline(
      history.concat([{
        tiles: tiles,
      }])
    );
    setStepNumber(history.length);
    setXIsNext(!xIsNext);
  };
  
  const jumpTo = (step) => {
    setStepNumber(step);
    setXIsNext((step % 2) === 0);
  };

  const getMoves = () => {
    return timeline.map((step, move) => {
      const desc = move ?
        `Go to move #${move}` :
        `Go to game start`;
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
      )
    })
  };

  const getStatus = () => {
    const current = timeline[stepNumber];
    const winner = calculateWinner(current.tiles);

    if (winner) {
      return `Winner: ${winner}`;
    }
    if (!current.tiles.includes(null)) {
      return 'Draw';
    }
    return 'Next player: ' + (xIsNext ? 'X' : 'O');
  };

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
        <ol>{getMoves()}</ol>
      </div>
    </div>
  );
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

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
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (tiles[a] && tiles[a] === tiles[b] && tiles[a] === tiles[c]) {
      return tiles[a];
    }
  }
  return null;
}
