import NeuralItem from "./NeuralItem";

<<<<<<< HEAD
// 1. Define the props interface
interface NeuralSpineProps {
  words?: { word: string; description?: string }[];
}

// 2. Keep your original list as the default fallback
const defaultNeuralWords = [
=======
const neuralWords = [
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  { word: "Potential", description: "Unlock your cognitive capabilities" },
  { word: "Retention", description: "Master long-term memory formation" },
  { word: "Excellence", description: "Achieve peak mental performance" },
  { word: "Precision", description: "Sharpen focus and clarity" },
  { word: "Neuroplasticity", description: "Rewire your neural pathways" },
  { word: "Evolution", description: "Continuous growth and adaptation" },
  { word: "Resilience", description: "Build mental fortitude" },
  { word: "Velocity", description: "Accelerate your learning speed" },
  { word: "Edge", description: "Gain the competitive advantage" },
];

<<<<<<< HEAD
const NeuralSpine = ({ words }: NeuralSpineProps) => {
  // 3. Determine which words to show (Dynamic vs Default)
  const displayWords = words && words.length > 0 ? words : defaultNeuralWords;

=======
const NeuralSpine = () => {
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
  return (
    <div className="flex flex-col py-10 pl-4 relative">
      {/* Removed Vertical Spine Line */}
      
<<<<<<< HEAD
      {displayWords.map((item, index) => (
        <NeuralItem
          key={`${item.word}-${index}`} // Added composite key for safety
=======
      {neuralWords.map((item, index) => (
        <NeuralItem
          key={item.word}
>>>>>>> 47f97d208d1ea2a89bf957da25f66293c38ac1ea
          word={item.word}
          description={item.description}
          delay={index * 100}
        />
      ))}
    </div>
  );
};

export default NeuralSpine;