import { LetterState, type Letter } from "./letter";
import { Word } from "./word";
import Axios from "axios";
import { GameStats } from "./gameStats";

export class Game {
  public maxAttempts: number;
  public guesses: Word[] = [];
  public guessIndex: number = 0;
  public gameState: GameState = GameState.Playing;
  public guessedLetters: Letter[] = [];
  public isBusy: boolean = false;
  public stats: GameStats | null = null;
  public playerNmae: string = "";
  public wordsList: string[] = [];

  private _secretWord: string = "";
  private set secretWord(value: string) {
    this._secretWord = value.toUpperCase();
  }
  public get secretWord(): string {
    return this._secretWord;
  }

  constructor(maxAttempts: number = 6) {
    this.maxAttempts = maxAttempts;
    this.isBusy = true;
    this.gameState = GameState.Initializing;
  }

  public async startNewGame(date?: string | undefined) {
    // Load the game
    this.isBusy = true;

    // Reset default values
    this.guessIndex = 0;
    this.guessedLetters = [];
    this.stats = null;

    // Get a word
    if (date) {
      this.secretWord = await this.getWordOfTheDayFromApi(date);
    } else {
      this.secretWord = await this.getRadnomWordFromApi();
    }

    // Populate guesses with the correct number of empty words
    this.guesses = [];
    for (let i = 0; i < this.maxAttempts; i++) {
      this.guesses.push(
        new Word({ maxNumberOfLetters: this.secretWord.length })
      );
    }

    // Start the game
    this.gameState = GameState.Playing;
    this.isBusy = false;
  }

  public setWordsList(words: string[]) {
    this.wordsList = words;
  }

  public get guess() {
    return this.guesses[this.guessIndex];
  }

  public setGuessLetters(word: string) {
    // Loop through the word and add new letters
    this.guess.clear();
    for (let i = 0; i < word.length; i++) {
      this.addLetter(word[i].toUpperCase());
    }
  }

  public removeLastLetter() {
    if (this.gameState === GameState.Playing) {
      this.guess.removeLastLetter();
    }
  }

  public addLetter(letter: string) {
    if (this.gameState === GameState.Playing) {
      this.guess.addLetter(letter);
    }
  }

  public updateGuessedLetters() {
    for (const letter of this.guess.letters) {
      // Find the index of the letter in the guessed letters array
      const index = this.guessedLetters.findIndex(
        (existingLetter) => existingLetter.char === letter.char
      );
      if (index !== -1) {
        // Do not update the letter if it is already correct
        if (this.guessedLetters[index].state !== LetterState.Correct) {
          // Do not update the letter if it is wrong
          if (letter.state !== LetterState.Wrong) {
            this.guessedLetters[index] = letter;
          }
        }
      } else {
        // If letter does not already exist, add it to the array
        this.guessedLetters.push(letter);
      }
    }
  }

  public async submitGuess(name: string, currentTime: number = 0) {
    if (this.gameState !== GameState.Playing) return;
    if (!this.guess.isFilled) return;
    if (!this.isValidWord(this.guess)) {
      this.guess.clear();
      return;
    }

    const isCorrect = this.guess.compare(this.secretWord);
    this.updateGuessedLetters();

    if (isCorrect) {
      this.gameState = GameState.Won;
    } else {
      if (this.guessIndex === this.maxAttempts - 1) {
        this.gameState = GameState.Lost;
      } else {
        this.guessIndex++;
      }
    }

    if (this.gameState === GameState.Won || this.gameState === GameState.Lost) {
      this.isBusy = true;
      var result = await Axios.post("/game/result", {
        attempts: this.guessIndex + 1,
        isWin: this.gameState === GameState.Won,
        word: this.secretWord,
        name: name,
        seconds: currentTime,
      });
      this.stats = new GameStats();
      Object.assign(this.stats, result.data);
      this.isBusy = false;
    }
  }

  public async getWordOfTheDayFromApi(date: string): Promise<string> {
    try {
      let wordUrl = "word/wordOfTheDay/" + date;

      const response = await Axios.get(wordUrl);

      console.log("Response from API: " + response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching word of the day:", error);
      return "ERROR"; // Probably best to print the error on screen, but this is kind of funny. :)
    }
  }

  public async getRadnomWordFromApi(): Promise<string> {
    try {
      let wordUrl = "word/randomWord";

      const response = await Axios.get(wordUrl);

      console.log("Response from API: " + response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching random word:", error);
      return "ERROR"; // Probably best to print the error on screen, but this is kind of funny. :)
    }
  }

  public isValidWord(word: Word): boolean {
    return this.wordsList.includes(word.word.toLowerCase());
  }

  public filterValidWords(): string[] {
    return this.wordsList.filter((word) => {
      for (let i = 0; i < this.guessedLetters.length; i++) {
        const letterObj = this.guessedLetters[i];
        const letterChar = letterObj.char.toLowerCase();

        const indexOfLetterInWord = word.indexOf(letterChar);
        const indexOfLetterInSecretWord = this.secretWord
          .toLowerCase()
          .indexOf(letterChar);
        if (
          word.includes(letterChar) &&
          this.guessedLetters[i].state === LetterState.Wrong
        ) {
          return false;
        }
        if (
          !word.includes(letterChar) &&
          (letterObj.state === LetterState.Correct ||
            letterObj.state === LetterState.Misplaced)
        ) {
          return false;
        }
        if (
          word.includes(letterChar) &&
          (letterObj.state === LetterState.Correct ||
            letterObj.state === LetterState.Misplaced) &&
          indexOfLetterInWord !== indexOfLetterInSecretWord
        ) {
          return false;
        }
      }
      return true;
    });
  }
}

export enum GameState {
  Playing,
  Won,
  Lost,
  Initializing,
}
