import React from "react"
import Die from "./components/Die"
import {nanoid} from "nanoid"
import confetti from "react-dom-confetti"
import "./App.css"

export default function App() {
    // states 
    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [roll, setRoll] = React.useState(0)
    const [elapsedTime, setElapsedTime] = React.useState(0)
    const [bestTime, setBestTime] = React.useState(
        () => localStorage.getItem("bestTime") || 0
    )
    const [intervalId, setIntervalId] = React.useState(null)
    
    // Use the effect to synchronize the dice state with tenzies state
    React.useEffect(() => {
        const checkWin = dice.every(die => die.isHeld && die.value === dice[0].value)
        checkWin ? setTenzies(!tenzies) : setTenzies(false)
    }, [dice])

    
    // Track time the game has taken
    React.useEffect(() => {
        if(tenzies === false) {
            const id = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1)
            }, 1000)
            setIntervalId(id)
            setBestTime(elapsedTime)
            return () => {
                clearInterval(id)
            } 
        }
    }, [tenzies])


    // Clear remove the interval effect when tenzies is true
    React.useEffect(() => {
        if (tenzies) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [tenzies]);


    // best time hooks

    React.useEffect(() => {
        if (elapsedTime < bestTime) {
            setBestTime(elapsedTime)
            localStorage.setItem("bestTime", elapsedTime)
        }
    }, [elapsedTime])

    
    // Get the dice Object
    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    // creating the array an initialising it as default in state 
    function allNewDice() {
        const newDice = new Array(10).fill().map(die => generateNewDie())
        return newDice
    }
    
    /* 
        if tenzies is false roll the dice otherwise meaning the game has ended set it to false again and then generate new dice for a new game
    */ 
    function rollDice() {
        if(!tenzies) {
            setRoll(roll + 1)
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            setTenzies(false)
            setDice(allNewDice())
            setRoll(0)
            setElapsedTime(0)
        }
    }
    
    // checks wether the die has been held that it doesnt re-roll keep the same die in state
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    // mapping over the dice array to generate the 10 die
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))

    
    return  (
        <main>
            {/*When the game has ended display the confetti*/}
            {tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
            <div className="dice-container">
                {diceElements}
            </div>
            <div>
                <p className="dice-roll_times">You have rolled: <span>{roll}</span> {roll > 1 ? "times" : "time" }</p>
                <p>Elapsed time: {elapsedTime} seconds</p>
                <p>Best time: {bestTime === 0 ? "N/A" : bestTime} seconds</p>
            </div>
            <button 
                className="roll-dice" 
                onClick={rollDice}
            >
                {/*if tenzies is true | game has ended set it to new game otherwise the game is still on roll the dice*/}
                {tenzies ? "New Game" : "Roll"} 
            </button>
        </main>
    )
}