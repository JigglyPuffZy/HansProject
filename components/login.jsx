import React, { useState, useRef } from 'react';
import { View, Text, Modal, TextInput, StyleSheet, TouchableOpacity, Alert, Animated, Easing, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Dice component to render dots based on dice value
const Dice = ({ diceValue }) => {
  const renderDots = () => {
    const diceLayout = {
      1: [[false, false, false], [false, true, false], [false, false, false]],
      2: [[true, false, false], [false, false, false], [false, false, true]],
      3: [[true, false, false], [false, true, false], [false, false, true]],
      4: [[true, false, true], [false, false, false], [true, false, true]],
      5: [[true, false, true], [false, true, false], [true, false, true]],
      6: [[true, false, true], [true, false, true], [true, false, true]],
    };

    return diceLayout[diceValue].map((row, rowIndex) => (
      <View key={rowIndex} style={styles.diceRow}>
        {row.map((isDot, colIndex) => (
          <View
            key={colIndex}
            style={[styles.dot, isDot && styles.dotVisible]}
          />
        ))}
      </View>
    ));
  };

  return <View style={styles.dice}>{renderDots()}</View>;
};

// Function to generate a random question based on the current level
const generateQuestion = (level, questionIndex) => {
  const questions = {
    0: [
      { question: "1. What is the GCF of 8x³-16x⁴+48x⁷?\na. 4x³\nb. 8x³\nc. 48x³", answer: "b" },
      { question: "2. If the factored form of n is 17(12x+46), what is n?\na. 187x+765\nb. 187x+782\nc. 204x+750", answer: "a" },
      { question: "3. Solve for x: 2x + 4 = 12.\na. x = 4\nb. x = 2\nc. x = 6", answer: "a" },
      { question: "4. Simplify: 3x - 5x + 4.\na. 2x\nb. -2x + 4\nc. -2x", answer: "c" },
      { question: "5. What is the LCM of 4 and 5?\na. 20\nb. 10\nc. 15", answer: "a" },
      { question: "6. What is the value of 5³?\na. 15\nb. 25\nc. 125", answer: "c" }
    ],
    1: [
      { question: "1. Solve for x: x² - 9 = 0.\na. x = 3\nb. x = ±3\nc. x = -9", answer: "b" },
      { question: "2. Expand: (x+3)(x-2).\na. x² + x - 6\nb. x² - x + 6\nc. x² + x + 6", answer: "a" },
      { question: "3. Solve for y: 4y - 8 = 0.\na. y = 2\nb. y = 0\nc. y = 4", answer: "a" },
      { question: "4. Find the derivative of x².\na. 2x\nb. x²\nc. 2", answer: "a" },
      { question: "5. What is the integral of 1/x?\na. ln(x)\nb. 1/x²\nc. e^x", answer: "a" },
      { question: "6. Solve: √16 + 3².\na. 7\nb. 25\nc. 13", answer: "c" }
    ],
    2: [
      { question: "1. What is the derivative of 3x³?\na. 9x²\nb. x²\nc. 6x", answer: "a" },
      { question: "2. Solve for x: x² - 25 = 0.\na. x = ±5\nb. x = 5\nc. x = -5", answer: "a" },
      { question: "3. What is the integral of x?\na. x²/2\nb. x²/3\nc. 1/x", answer: "a" },
      { question: "4. Simplify: (2x)(3x).\na. 6x²\nb. 5x\nc. x³", answer: "a" },
      { question: "5. Find the LCM of 12 and 15.\na. 60\nb. 30\nc. 45", answer: "a" },
      { question: "6. Solve for y: y² = 49.\na. y = 7\nb. y = ±7\nc. y = 0", answer: "b" }
    ]
  };

  // Return the question based on the current level and index
  return questions[level][questionIndex];
};

export default function DiceGame() {
  const [dice, setDice] = useState(1);
  const [guess, setGuess] = useState('');
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [level, setLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [rolledNumber, setRolledNumber] = useState(null);

  // Animated values for dice roll
  const diceRotateX = useRef(new Animated.Value(0)).current;
  const diceRotateY = useRef(new Animated.Value(0)).current;
  const diceScale = useRef(new Animated.Value(1)).current;

  // Roll dice with animation
  const rollDice = () => {
    const rolledNumber = Math.floor(Math.random() * 6) + 1; // Generate random number
    setRolledNumber(rolledNumber);
    setShowModal(true); // Show modal to guess the number

    // Dice roll animation
    Animated.parallel([
      Animated.timing(diceRotateX, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(diceRotateY, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(diceScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(diceScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Reset after animation completes
      diceRotateX.setValue(0);
      diceRotateY.setValue(0);
      setDice(rolledNumber); // Set the rolled number after animation
    });
  };

  // Handle guess input
  const handleGuess = () => {
    const guessedNumber = parseInt(guess);

    // Validate guess
    if (isNaN(guessedNumber) || guessedNumber < 1 || guessedNumber > 6) {
      Alert.alert("Invalid Guess!", "Please enter a number between 1 and 6.");
      return;
    }

    // Check if the guess is correct
    if (guessedNumber === dice) {
      setCorrectGuesses(correctGuesses + 1);
      setGuess(''); // Reset guess
      setShowModal(false); // Hide the guess modal

      // Generate question for the current level
      const { question: newQuestion, answer } = generateQuestion(level, currentQuestionIndex);
      setQuestion(newQuestion);
      setQuestionAnswer(answer);
      setShowQuestionModal(true); // Show question modal
    } else {
      // Show error modal for incorrect guess
      setShowErrorModal(true);
      setGuess(''); // Reset guess for next attempt
      rollDice(); // Roll the dice again
    }
    Keyboard.dismiss();
  };

  const handleQuestionAnswer = () => {
    // Check if the question answer is correct
    if (guess.toLowerCase() === questionAnswer) {
      setCorrectGuesses(correctGuesses + 1);
      setGuess(''); // Reset guess
      setShowQuestionModal(false); // Hide question modal

      // Move to next question
      const nextQuestionIndex = currentQuestionIndex + 1;

      // Check if all questions for the current level have been answered
      if (nextQuestionIndex < 6) {
        setCurrentQuestionIndex(nextQuestionIndex);
        const { question: newQuestion, answer } = generateQuestion(level, nextQuestionIndex);
        setQuestion(newQuestion);
        setQuestionAnswer(answer);
        setShowQuestionModal(true); // Show next question modal
      } else {
        // Move to next level if all questions answered
        setLevel(level + 1);
        setCurrentQuestionIndex(0);
        rollDice(); // Roll dice for the next level
      }
    } else {
      Alert.alert("Incorrect Answer!", "Try again!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dice Game</Text>
      <LinearGradient colors={['#8a2be2', '#f0e68c']} style={styles.gradient} />
      <TouchableOpacity onPress={rollDice} style={styles.button}>
        <Text style={styles.buttonText}>Roll Dice</Text>
      </TouchableOpacity>
      <View style={styles.diceContainer}>
        <Animated.View style={{
          transform: [
            { rotateX: diceRotateX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
            { rotateY: diceRotateY.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] } )},
            { scale: diceScale }
          ],
        }}>
          <Dice diceValue={dice} />
        </Animated.View>
      </View>

      {/* Guess Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Guess the Dice Number!</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a number between 1 and 6"
            keyboardType="numeric"
            value={guess}
            onChangeText={setGuess}
          />
          <TouchableOpacity onPress={handleGuess} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Submit Guess</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={showErrorModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Wrong Guess!</Text>
          <TouchableOpacity onPress={() => setShowErrorModal(false)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Question Modal */}
      <Modal visible={showQuestionModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Answer the Question:</Text>
          <Text style={styles.questionText}>{question}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your answer (a, b, or c)"
            value={guess}
            onChangeText={setGuess}
          />
          <TouchableOpacity onPress={handleQuestionAnswer} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Submit Answer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowQuestionModal(false)} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  diceContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  dice: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  diceRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    margin: 2,
    opacity: 0, // Start hidden
  },
  dotVisible: {
    opacity: 1, // Show when active
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay
    padding: 20,
},
modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
},


  modalTitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
  questionText: {
    color: 'white',
    marginBottom: 10,
  },
});
