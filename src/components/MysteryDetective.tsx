import { useState } from "react";

const PROPERTIES:any = {
  size: {
    big: { class: "w-10 h-10 p-8", description: "Large" },
    small: { class: "w-6 h-6 p-5", description: "Small" },
  },
  texture: {
    smooth: {
      class: "rounded-full",
      description: "Smooth",
    },
    rough: {
      class: "rounded-none",
      description: "Rough",
    },
  },
};

const initialMarbles = [
  { id: 1, color: "red", size: "big", texture: "smooth", weight: 20 },
  { id: 2, color: "red", size: "big", texture: "rough", weight: 2 },
  { id: 3, color: "red", size: "big", texture: "smooth", weight: 19 },
  { id: 4, color: "red", size: "big", texture: "rough", weight: 17 },
  { id: 5, color: "red", size: "small", texture: "smooth", weight: 4 },
  { id: 6, color: "red", size: "small", texture: "rough", weight: 10 },

  { id: 7, color: "blue", size: "small", texture: "smooth", weight: 15 },
  { id: 8, color: "blue", size: "small", texture: "rough", weight: 3 },
  { id: 9, color: "blue", size: "small", texture: "smooth", weight: 18 },
  { id: 10, color: "blue", size: "small", texture: "rough", weight: 2 },
  { id: 11, color: "blue", size: "big", texture: "smooth", weight: 26 },
  { id: 12, color: "blue", size: "big", texture: "rough", weight: 7 },
];

const QUESTION_LIBRARY = {
  Color: {
    question: "Is it red?",
    check: (m:any) => m.color === "red",
  },
  Size: {
    question: "Is it large?",
    check: (m:any) => m.size === "big",
  },
  Texture: {
    question: "Is it rough?",
    check: (m:any) => m.texture === "rough",
  },
  Weight: {
    question: "Is it heavy (>=15kg)?",
    check: (m:any) => m.weight >= 15,
  },
};

function calculateGini(marbles:any) {
  const total = marbles.length;
  if (total === 0) return 0;

  const redCount = marbles.filter((m:any) => m.color === "red").length;
  const pRed = redCount / total;
  return 1 - (pRed ** 2 + (1 - pRed) ** 2);
}

function countSplits(node:any) {
  let splits = node.question ? 1 : 0;
  node.children.forEach((child:any) => {
    splits += countSplits(child);
  });
  return splits;
}

// let idCounter = 1;
// function generateId() {
//   idCounter++;
//   return idCounter;
// }

function Marble({ marble, onInspect }:any) {
  const bgColor = marble.color === "red" ? "bg-red-500" : "bg-blue-500";
  const opacity = Math.min(100, 40 + marble.weight) / 100;

  return (
    <button
      onClick={() => onInspect(marble)}
      className={`
        ${PROPERTIES.size[marble.size].class}
        ${PROPERTIES.texture[marble.texture].class}
        ${bgColor}
        text-base font-medium
        m-1 flex items-center justify-center
        text-white shadow-lg hover:scale-110 transition-transform
      `}
      style={{ opacity }}
    >
      {marble.weight}kg
    </button>
  );
}

function Node({ node, depth, onSplit, onInspect, splittedCount }:any) {
  const redCount = node.marbles.filter((m:any) => m.color === "red").length;
  const blueCount = node.marbles.length - redCount;
  const gini = calculateGini(node.marbles);
  const total = redCount + blueCount;
  const redPercentage = total > 0 ? (redCount / total) * 100 : 0;

  const availableQuestions = Object.entries(QUESTION_LIBRARY).filter(
    ([key]) => {
      if (key === "Color" && splittedCount < 2) {
        return false;
      }
      return true;
    }
  );

  return (
    <div
      className={`node ${
        depth > 0 ? "mt-8" : ""
      } flex flex-col items-center w-full`}
    >
      <div
        className={`p-4 border-2 ${
          gini === 0 ? "border-green-500" : "border-gray-300"
        } 
           rounded-lg bg-white relative shadow-xl w-full max-w-md`}
      >
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(90deg, rgba(239,68,68,0.1) ${redPercentage}%, rgba(59,130,246,0.1) ${redPercentage}%)`,
          }}
        />

        <div className="flex flex-wrap mb-3 relative z-10">
          {node.marbles.map((marble:any) => (
            <Marble key={marble.id} marble={marble} onInspect={onInspect} />
          ))}
        </div>

        <div className="text-sm relative z-10">
          <div className="flex gap-2 mb-1">
            <span className="text-red-500">🔴 {redCount}</span>
            <span className="text-blue-500">🔵 {blueCount}</span>
          </div>
          <p className="text-xs text-gray-600">Gini: {gini.toFixed(2)}</p>
          {node.question && (
            <p className="mt-1 text-blue-600 font-medium">{node.question}</p>
          )}
        </div>

        {gini > 0 && !node.question && (
          <div className="mt-3 space-y-2 relative z-10">
            <p className="text-xs text-gray-600">Ask:</p>
            <div className="flex gap-2 flex-wrap">
              {availableQuestions.length > 0 ? (
                availableQuestions.map(([key, q]) => (
                  <button
                    key={key}
                    onClick={() => onSplit(node.id, q.question)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    {q.question}
                  </button>
                ))
              ) : (
                <p className="text-xs text-red-600">No questions available</p>
              )}
            </div>
            {splittedCount < 2 && (
              <p className="text-xs text-red-500">
                "Is it red?" locked until 2 splits are done!
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-8 justify-center mt-6 w-full">
        {node.yesId && (
          <Node
            node={node.children.find((n:any) => n.id === node.yesId)}
            depth={depth + 1}
            onSplit={onSplit}
            onInspect={onInspect}
            splittedCount={splittedCount}
          />
        )}
        {node.noId && (
          <Node
            node={node.children.find((n:any) => n.id === node.noId)}
            depth={depth + 1}
            onSplit={onSplit}
            onInspect={onInspect}
            splittedCount={splittedCount}
          />
        )}
      </div>
    </div>
  );
}

function InstructionsModal({ onClose }:any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          Welcome to Marble Decision Tree Explorer!
        </h2>
        <p className="mb-4 text-gray-700">
          Welcome, young scientist! You have discovered a **magical jar** filled
          with colorful marbles, each with its own **unique properties** like
          size, texture, weight, and color. Your mission? **Sort the marbles**
          by asking smart questions!
          <br />
          <br />
          Each time you **ask a question**, the jar will **magically split**
          into two smaller jars! Your goal is to **keep splitting** until all
          jars contain only one type of marble.
          <br />
          <br />
          **How to Play:** - **Click a question** to divide the jar based on a
          marble’s property. - **Click a marble** to see its details up close. -
          **Use Undo/Redo** to try different ways to split your jar. - Watch how
          the **Gini score** changes as you make better splits!
          <br />
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function MysteryDetective() {
  const [tree, setTree] = useState({
    id: 1,
    marbles: initialMarbles,
    question: null,
    yesId: null,
    noId: null,
    children: [],
    parentGini: null,
  });

  const [history, setHistory] = useState([tree]);
  const [currentState, setCurrentState] = useState(0);
  const [inspectedMarble, setInspectedMarble] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const splittedCount = countSplits(history[currentState]);

  const handleSplit = (nodeId:any, question:any) => {
    const splitter = Object.values(QUESTION_LIBRARY).find(
      (q) => q.question === question
    );
    if (!splitter) return;

    const updateTree = (node:any) => {
      if (node.id === nodeId) {
        const yesMarbles = node.marbles.filter(splitter.check);
        const noMarbles = node.marbles.filter((m:any) => !splitter.check(m));

        if (yesMarbles.length === 0 || noMarbles.length === 0) {
          alert(
            "This question does not effectively split the marbles. Please try a different question."
          );
          return node;
        }

        const yesId = nodeId * 2;
        const noId = nodeId * 2 + 1;

        const newChildren = [
          {
            id: yesId,
            marbles: yesMarbles,
            question: null,
            yesId: null,
            noId: null,
            children: [],
            parentGini: calculateGini(yesMarbles),
          },
          {
            id: noId,
            marbles: noMarbles,
            question: null,
            yesId: null,
            noId: null,
            children: [],
            parentGini: calculateGini(noMarbles),
          },
        ];

        return {
          ...node,
          question: splitter.question,
          yesId,
          noId,
          children: newChildren,
        };
      }
      return {
        ...node,
        children: node.children.map(updateTree),
      };
    };

    const newTree = updateTree(history[currentState]);
    setTree(newTree);
    setHistory([...history.slice(0, currentState + 1), newTree]);
    setCurrentState(currentState + 1);
  };

  const undo = () => {
    if (currentState > 0) {
      setCurrentState(currentState - 1);
      setTree(history[currentState - 1]);
    }
  };

  const redo = () => {
    if (currentState < history.length - 1) {
      setCurrentState(currentState + 1);
      setTree(history[currentState + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Marble Decision Tree Explorer
          </h1>
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              ↩ Undo
            </button>
            <button
              onClick={redo}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              ↪ Redo
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Visual Guide</h2>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium mb-2">Weight</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center text-black text-base">
                  Heavy
                </div>
                <span> ({`>=`}15kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-black text-base">
                  Light
                </div>
                <span>(15kg)</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gray-500 rounded-full"></div>
                <span>Large (Smooth)</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gray-500 rounded-none"></div>
                <span>Large (Rough)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                <span>Small (Smooth)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded-none"></div>
                <span>Small (Rough)</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Texture</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
                <span>Smooth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-500 rounded-none"></div>
                <span>Rough</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                <span>Red</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <span>Blue</span>
              </div>
            </div>
          </div>
        </div>

        <Node
          node={history[currentState]}
          depth={0}
          onSplit={handleSplit}
          onInspect={setInspectedMarble}
          splittedCount={splittedCount}
        />

        {inspectedMarble && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-6 rounded-lg max-w-sm">
              <h3 className="text-xl font-bold mb-4">Marble Details</h3>
              <div className="flex flex-col items-center mb-4">
                <div
                  className={`
                  ${PROPERTIES.size[inspectedMarble.size].class}
                  ${PROPERTIES.texture[inspectedMarble.texture].class}
                  ${
                    inspectedMarble.color === "red"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }
                  flex items-center justify-center text-white
                `}
                >
                  {inspectedMarble.weight}kg
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Color:</strong> {inspectedMarble.color}
                </li>
                <li>
                  <strong>Size:</strong>{" "}
                  {PROPERTIES.size[inspectedMarble.size].description}
                </li>
                <li>
                  <strong>Texture:</strong>{" "}
                  {PROPERTIES.texture[inspectedMarble.texture].description}
                </li>
                <li>
                  <strong>Weight:</strong> {inspectedMarble.weight}kg
                </li>
              </ul>
              <button
                onClick={() => setInspectedMarble(null)}
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
            <ul className="space-y-2 text-sm">
              <li>• Pure nodes have Gini 0 (all same color)</li>
              <li>• Effective questions reduce impurity quickly</li>
              <li>• Combining multiple features helps achieve better splits</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-sm">
              <li>• Color question unlocks after 2 splits</li>
              <li>• Compare parent/child Gini values</li>
              <li>• Use undo/redo to experiment with different splits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
