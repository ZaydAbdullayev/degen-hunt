import { useRef, useState, useEffect } from "react";
import "./home.css";
import { RiTwitterXFill } from "react-icons/ri";
import user1 from "./assets/user.png";
import user2 from "./assets/user2.png";
import user3 from "./assets/user3.png";
import music from "./assets/music.mp3";
import claim from "./assets/claim.mp3";
import eror from "./assets/eror.mp3";
import capsule from "./assets/capsul.png";

const GAME_DURATION = 60000;

const DIFFICULTY_LEVELS = {
  easy: 1000,
  medium: 700,
  hard: 500,
};

const OBJECT_TYPES = [
  { type: "capsule", score: 1, className: "pill capsule" },
  { type: "sol", score: 10, className: "pill sol" },
  { type: "bad", score: -1, className: "pill bad" },
];

const characters = [
  { name: "char1", img: user1 },
  { name: "char2", img: user2 },
  { name: "char3", img: user3 },
];

const getRandomUsername = () => {
  const prefixes = [
    "@sol_",
    "@moon_",
    "@dark_",
    "@jack_",
    "@ghost_",
    "@neo_",
    "@www_",
    "@bot_",
    "@user_",
    "@dev_",
  ];
  const suffix = Math.floor(Math.random() * 1000);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix}${suffix}`;
};

const getRandomScore = () => Math.floor(Math.random() * 100) + 100; // 100–199

const leaders = Array.from({ length: 15 }, (_, i) => ({
  name: getRandomUsername(),
  score: getRandomScore(),
}));

function getRandomPosition() {
  const container = document.querySelector(".game-stage");
  if (!container) return { x: 0, y: 0 };
  const { width, height } = container.getBoundingClientRect();
  const PILL_SIZE = 60;
  const x = Math.random() * Math.max(0, width - PILL_SIZE);
  const y = Math.random() * Math.max(0, height - PILL_SIZE);
  return { x, y };
}

function Pill({ id, x, y, className, onClick }) {
  return (
    <div
      className={className}
      style={{ left: x, top: y }}
      onClick={() => onClick(id)}
    />
  );
}

export const App = () => {
  const [gamePhase, setGamePhase] = useState("intro");
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [objectLifespan, setObjectLifespan] = useState(1000);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [objects, setObjects] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [audio] = useState(new Audio(music));
  const [errorAudio] = useState(new Audio(eror));
  const [claimAudio] = useState(new Audio(claim));
  const [isMusicStarted, setIsMusicStarted] = useState(false);

  const timeoutRef = useRef(null);
  const timeRef = useRef(GAME_DURATION);
  const isGameOver = useRef(false);

  // ----------------------- GAME LOOP -----------------------

  const spawnNext = () => {
    if (isGameOver.current) return;

    const { x, y } = getRandomPosition();
    const token = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
    const id = Date.now() + Math.random();

    setObjects([{ id, x, y, ...token }]);

    timeoutRef.current = setTimeout(() => {
      setObjects([]);
      spawnNext();
    }, objectLifespan);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    timeRef.current = GAME_DURATION;
    isGameOver.current = false;
    setObjects([]);
    setGamePhase("playing");

    spawnNext();

    const timer = setInterval(() => {
      timeRef.current -= 1000;
      setTimeLeft(timeRef.current);

      if (timeRef.current <= 0) {
        clearInterval(timer);
        clearTimeout(timeoutRef.current);
        setObjects([]);
        isGameOver.current = true;
        setGamePhase("gameover");
      }
    }, 1000);
  };

  const handlePillClick = (id) => {
    const obj = objects.find((o) => o.id === id);
    if (!obj) return;

    clearTimeout(timeoutRef.current);
    setScore((s) => s + obj.score);
    setObjects([]);

    // Ses çal
    if (obj.score > 0) {
      claimAudio.currentTime = 0;
      claimAudio.play();
    } else if (obj.score < 0) {
      errorAudio.currentTime = 0;
      errorAudio.play();
    }

    setTimeout(() => {
      spawnNext();
    }, 100);
  };

  useEffect(() => {
    const playMusic = () => {
      if (!isMusicStarted) {
        audio.loop = true;
        audio.volume = 0.1;
        audio.play().catch((err) => console.log("Autoplay blocked:", err));
        setIsMusicStarted(true);
      }
    };

    document.addEventListener("click", playMusic, { once: true });

    return () => document.removeEventListener("click", playMusic);
  }, [isMusicStarted, audio]);

  // ----------------------- UI -----------------------

  return (
    <div className="game-container">
      {gamePhase === "intro" && (
        <div className="center-screen">
          <h1>DEGEN HUNT</h1>
          <div className="btns">
            <button onClick={() => setShowLeaderboard(true)}>
              LEADER BOARD
            </button>
            <button onClick={() => setGamePhase("character")}>START</button>
            <button
              onClick={() =>
                window.open("https://x.com/degenhunt_sol", "_blank")
              }
            >
              FOLLOW US <RiTwitterXFill />
            </button>
          </div>
        </div>
      )}

      {gamePhase === "character" && (
        <div className="center-screen">
          <h2>{">"} SELECT YOUR CHARACTER</h2>
          <div className="character-options">
            {characters.map((char) => (
              <div
                key={char}
                className={`character ${char}`}
                onClick={() => {
                  setSelectedCharacter(char);
                  setGamePhase("difficulty");
                }}
              >
                <img src={char.img} alt={char.name} />
              </div>
            ))}
          </div>
          <button className="go-home" onClick={() => setGamePhase("intro")}>
            Go Home
          </button>
        </div>
      )}

      {gamePhase === "difficulty" && (
        <div className="modal">
          <h3>Level of Difficulty</h3>
          <div className="btns">
            <button
              onClick={() => {
                setDifficulty("easy");
                setObjectLifespan(DIFFICULTY_LEVELS.easy);
                startGame();
              }}
            >
              Easy
            </button>
            <button
              onClick={() => {
                setDifficulty("medium");
                setObjectLifespan(DIFFICULTY_LEVELS.medium);
                startGame();
              }}
            >
              Medium
            </button>
            <button
              onClick={() => {
                setDifficulty("hard");
                setObjectLifespan(DIFFICULTY_LEVELS.hard);
                startGame();
              }}
            >
              Hard
            </button>
          </div>
        </div>
      )}

      {gamePhase === "playing" && (
        <div className="game-screen">
          <div className="hud">
            <p>SCORE: {score}</p>
            <p>TIME LEFT: {timeLeft / 1000}s</p>
            <p>DIFFICULTY: {difficulty}</p>
            <button onClick={() => setGamePhase("intro")}>QUIT</button>
          </div>
          <div className="selected-character">
            {selectedCharacter && (
              <img src={selectedCharacter.img} alt={selectedCharacter.name} />
            )}
          </div>
          <div className="game-stage">
            <div className="title">
              <p>just catch this object</p>
              <img src={capsule} alt="capsule" />
            </div>
            {objects.map((obj) => (
              <Pill key={obj.id} {...obj} onClick={handlePillClick} />
            ))}
          </div>
        </div>
      )}

      {gamePhase === "gameover" && (
        <div className="modal">
          <h2>TIME IS UP</h2>
          <p>TOTAL SCORE: {score}</p>
          <div className="btns">
            <button onClick={() => setGamePhase("character")}>
              RESTART GAME
            </button>
            <button onClick={() => setGamePhase("intro")}>GO HOME</button>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="modal">
          <h2>LEADER BOARD</h2>
          <div className="leaderboard">
            {leaders.map((leader, index) => (
              <div key={index} className="leader-item">
                <span>{index + 1}</span>
                <span>{leader.name}</span>
                <span>{leader.score}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowLeaderboard(false)}>CLOSE</button>
        </div>
      )}
    </div>
  );
};
