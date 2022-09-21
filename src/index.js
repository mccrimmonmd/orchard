import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ squares, onClick }) {
  const renderSquare = (i) => {
    return (
      <Square 
        value={squares[i]}
        onClick={() => onClick(i)}
      />
    );
  };

  return (
    <div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
    </div>
  );
}

function Game(props) {
  const { timeline, setTimeline } = useState([{
    squares: Array(9).fill(null),
  }]);
  const { stepNumber, setStepNumber } = useState(0);
  const { xIsNext, setXIsNext } = useState(true);

  const handleClick = (i) => {
    const history = timeline.slice(0, stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? 'X' : 'O';
    setTimeline(
      history.concat([{
        squares: squares,
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
    const winner = calculateWinner(current.squares);

    if (winner) {
      return `Winner: ${winner}`;
    }
    if (!current.squares.includes(null)) {
      return 'Draw';
    }
    return 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board 
          squares={timeline[stepNumber].squares}
          onClick={(i) => handleClick(i)}
        />
      </div>
      <div className="game-info">
        <div>{getStatus}</div>
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

function calculateWinner(squares) {
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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
  