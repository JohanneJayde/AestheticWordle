﻿using Microsoft.EntityFrameworkCore;
using Wordle.Api.Dtos;
using Wordle.Api.Models;

namespace Wordle.Api.Services;
public class GameService(WordleDbContext db)
{
    public WordleDbContext Db { get; set; } = db;

    public async Task<Game> PostGameResult(GameDto gameDto)
    {
        // Get todays date
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Get all the words that match our game word and load their WOTDs
        var word = Db.Words
        .Include(word => word.WordsOfTheDays)
            .Where(word => word.Text == gameDto.Word)
            .First();

        // Create a new game object to save to the DB
        Game game = new()
        {
            Attempts = gameDto.Attempts,
            IsWin = gameDto.IsWin,
            // Attempt to find the WOTD that best matches todays date
            WordOfTheDay = word.WordsOfTheDays
                .OrderByDescending(wotd => wotd.Date)
                .FirstOrDefault(wotd => wotd.Date <= today),
            Word = word,
            Seconds = gameDto.Seconds,
        };

        Db.Games.Add(game);
        await Db.SaveChangesAsync();
        return game;
    }

    public async Task<GameStatsDto> GetGameStats(Game game)
    {
        var gamesForWord = Db.Games.Where(g => g.WordId == game.WordId);

        GameStatsDto stats = new()
        {
            Word = game.Word!.Text,
            AverageGuesses = await gamesForWord.AverageAsync(g => g.Attempts),
            TotalTimesPlayed = await gamesForWord.CountAsync(),
            AverageSeconds = await gamesForWord.AverageAsync(g => g.Seconds),
            TotalWins = await gamesForWord.CountAsync(g => g.IsWin)
        };

        return stats;
    }

    public IQueryable<AllWordStats> StatsForAllWords()
    {
        IQueryable<AllWordStats> result = Db.Games
            .Include(g => g.Word)
            .GroupBy(g => g.Word!.Text)
            .Select(g => new AllWordStats()
            {
                Word = g.Key,
                AverageGuesses = g.Average(x => x.Attempts)
            });

        return result;
    }

    public async Task<GameStatsDto> WordOfDayStats(DateTime date)
    {
        DateOnly dateOnly = DateOnly.FromDateTime(date);

        WordOfTheDay? word = await Db.WordsOfTheDays
            .Include(wotd => wotd.Games)
            .FirstOrDefaultAsync(wotd => wotd.Date == dateOnly);

        IEnumerable<Game> wordOfTheDayGames;
        GameStatsDto stats;

        if (word is not null && word.Games.Count != 0)
        {
            wordOfTheDayGames =  word.Games;

            stats = new()
            {
                Date = word!.Date,
                AverageGuesses = wordOfTheDayGames.Average(g => g.Attempts),
                TotalTimesPlayed = wordOfTheDayGames.Count(),
                TotalWins = wordOfTheDayGames.Count(g => g.IsWin),
                AverageSeconds = wordOfTheDayGames.Average(w => w.Seconds)
            };

        }
        else
        {
            stats = new()
            {
                Date = dateOnly,
                AverageGuesses = 0,
                TotalTimesPlayed = 0,
                TotalWins = 0,
                AverageSeconds = 0
            };
        }

  
        return stats;
    }
}

public class AllWordStats()
{
    public required string Word { get; set; }

    public double AverageGuesses { get; set; }
}
