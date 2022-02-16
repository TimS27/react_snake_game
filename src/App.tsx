import React, { useEffect, useRef, useState } from "react";
import "./App.scss";
import Apple from "./Images/apple2.png";
import Pill from "./Images/pill.png";
import Snake from "./Images/snake.png";
import useInterval from "./useInterval";

const canvasX = 700;
const canvasY = 700;
const initialSnake = [
  [4, 10],
  [4, 10],
];
const initialApple = [10, 5];
const initialPill = [11, 1];
const scale = 50;
const timeDelay = 100;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [pill, setPill] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useInterval(() => runGame(), delay);

  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement;
    let meds = document.getElementById("meds") as HTMLCanvasElement;
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "#00b100";
        snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1, 1);
        ctx.drawImage(meds, pill[0], pill[1], 1, 1);
      }
    }
  }, [snake, apple, gameOver, score, pill]); //update after each change in snake, apple, score, pill or gameOver

  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score));
    }
  }

  function play() {
    setSnake(initialSnake);
    setApple(initialApple);
    setPill(initialPill);
    setDirection([1, 0]);
    setDelay(timeDelay);
    setScore(0);
    setGameOver(false);
  }

  function checkCollision(head: number[]) {
    //check wall collision
    for (let i = 0; i < head.length; i++) {
      if (head[i] < 0 || head[i] * scale >= canvasX) return true; //checks (head < left/bottom-wall || head < right/top-wall)
    }
    //check self collision
    for (const s of snake) {
      if (head[0] === s[0] && head[1] === s[1]) return true;
    }
    return false;
  }

  function atePill(newSnake: number[][]) {
    let randomPillCoordX = Math.floor((Math.random() * canvasX) / scale);
    let randomPillCoordY = Math.floor((Math.random() * canvasY) / scale);
    let rightPosition = false;

    //make sure pill doesn't spawn in snakes body
    while (rightPosition === false) {
      rightPosition = true;
      for (let coord in snake) {
        if (coord === String(randomPillCoordX) + String(randomPillCoordY)) {
          rightPosition = false;
          randomPillCoordX = Math.floor((Math.random() * canvasX) / scale);
          randomPillCoordY = Math.floor((Math.random() * canvasY) / scale);
        } else {
          rightPosition = true;
        }
      }
    }
    let pillCoord = [randomPillCoordX, randomPillCoordY];

    if (newSnake[0][0] === pill[0] && newSnake[0][1] === pill[1]) {
      setPill([100, 100]);
      return true;
    }
    if (Math.random() < 0.01) {
      let newPill = pillCoord;
      setPill(newPill);
    }
    return false;
  }

  function ateApple(newSnake: number[][]) {
    let randomAppleCoordX = Math.floor((Math.random() * canvasX) / scale);
    let randomAppleCoordY = Math.floor((Math.random() * canvasY) / scale);
    let rightPosition = false;

    //make sure apple doesn't spawn in snakes body
    while (rightPosition === false) {
      rightPosition = true;
      for (let coord in snake) {
        if (coord === String(randomAppleCoordX) + String(randomAppleCoordY)) {
          rightPosition = false;
          randomAppleCoordX = Math.floor((Math.random() * canvasX) / scale);
          randomAppleCoordY = Math.floor((Math.random() * canvasY) / scale);
        } else {
          rightPosition = true;
        }
      }
    }
    let appleCoord = [randomAppleCoordX, randomAppleCoordY];

    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = appleCoord;
      setScore(score + 1);
      setApple(newApple);
      return true;
    }
    return false;
  }

  function runGame() {
    const newSnake = [...snake];
    const newSnakeHead = [newSnake[0][0] + direction[0], newSnake[0][1] + direction[1]];
    newSnake.unshift(newSnakeHead);

    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      handleSetScore();
    }
    if (!ateApple(newSnake)) {
      newSnake.pop();
    }

    if (atePill(newSnake)) {
      let newDelay = 0;
      if (delay !== null) {
        newDelay = delay;
      } else {
        newDelay = 50;
      }

      if (Math.random() < 0.5) {
        setDelay(newDelay + 20);
      } else {
        setDelay(newDelay - 20);
      }
    }

    setSnake(newSnake);
  }

  function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "Enter":
        play();
        break;
      case "ArrowLeft":
        setDirection([-1, 0]);
        break;
      case "ArrowRight":
        setDirection([1, 0]);
        break;
      case "ArrowUp":
        setDirection([0, -1]);
        break;
      case "ArrowDown":
        setDirection([0, 1]);
        break;
    }
  }

  return (
    <div className='App' onKeyDown={(e) => changeDirection(e)}>
      <img id='fruit' src={Apple} alt='apple' width='30' />
      <img id='meds' src={Pill} alt='pill' width='30' />
      <div className='gameZone'>
        <canvas
          className='playArea'
          ref={canvasRef}
          width={`${canvasX}px`}
          height={`${canvasY}px`}
        />
        {gameOver && <div className='gameOver'>Game Over</div>}
        <button onClick={play} className='playButton'>
          Play
        </button>
      </div>
      <div className='scoreBox'>
        <h2>Score: {score}</h2>
        <h2>High Score: {localStorage.getItem("snakeScore")}</h2>
        <img src={Snake} alt='snake' width='300px' />
      </div>
    </div>
  );
}

export default App;
