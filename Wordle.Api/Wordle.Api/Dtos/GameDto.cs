﻿namespace Wordle.Api.Dtos;

public class GameDto
{
    public int Attempts { get; set; }
    public int Seconds { get; set; }

    public bool IsWin { get; set; }

    public required string Word {  get; set; }

    public string Name { get; set; } = null!;
}

