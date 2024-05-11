import { expect, test } from "vitest";
import { Game } from "~/scripts/game";
import { WordList } from "~/scripts/wordList";
import { filterValidWords } from "~/scripts/wordListUtils";

test("filterValidWords init contains all wordlist", () => {
  const game = new Game();
  // test if filterValidWords returns an array
  expect(filterValidWords(game).length).equal(WordList.length);
});

test("filterValidWords removes words with wrong letters", async () => {
  const game = new Game();
  await game.startNewGame("hello");
  game.guess.addLetter("H");
  game.guess.addLetter("A");
  game.guess.addLetter("N");
  game.guess.addLetter("D");
  game.guess.addLetter("S");
  game.submitGuess();

  expect(filterValidWords(game)).not.toContain("hands");
  expect(filterValidWords(game)).not.toContain("snare");
});

test("filterValidWords removes words with correct letters in wrong position", async () => {
  const game = new Game();
  await game.startNewGame("hello");

  game.guess.addLetter("L");
  game.guess.addLetter("A");
  game.guess.addLetter("M");
  game.guess.addLetter("P");
  game.guess.addLetter("S");
  game.submitGuess();

  expect(filterValidWords(game)).not.toContain("loads");
  expect(filterValidWords(game)).not.toContain("laced");
});

test("filterValidWords contains words with letters that are misplaced in different position", async () => {
  const game = new Game();
  await game.startNewGame("hello");

  game.guess.addLetter("p");
  game.guess.addLetter("u");
  game.guess.addLetter("l");
  game.guess.addLetter("s");
  game.guess.addLetter("e");
  game.submitGuess();

  expect(filterValidWords(game)).toContain("biggy");
  expect(filterValidWords(game)).toContain("drink");
});
