# Basketball Statistics Analysis Tool

## Overview
This project is a Node.js command-line interface (CLI) tool designed to ingest, parse, and analyze raw basketball data. It processes player demographics and game statistics from CSV files to answer specific analytical questions regarding player attributes and performance.

The solution handles "dirty" real-world data, performing unit conversions (Imperial/Metric) and parsing complex string formats to derive accurate insights.

## Features
The script processes the data to solve the following three specific problems:

1.  **Identify Heaviest Male Players:** Finds the top 5 heaviest male players across all countries, standardizing weights to pounds (lbs) for comparison.
2.  **Find Tallest Female (China):** Identifies the single tallest female player from China, parsing height strings (feet/inches) and converting to centimeters.
3.  **Highest Scoring Canadian Male:** Aggregates game data to determine which male Canadian player scored the most points across all recorded games.

## Data Structures

The project relies on two specific CSV data files located in the root directory:

### 1. `players.csv`
[cite_start]Contains demographic and physical attributes for players[cite: 2].
* **Format:** `id, first_name, last_name, country, gender, age, weight, height`
* **Data Parsing Challenges:**
    * **Weight:** Mixed units (e.g., `"60kg"`, `"160lbs"`).
    * **Height:** String format (e.g., `"6feet0inches"`).

### 2. `games.csv`
[cite_start]Contains statistical data for played matches[cite: 1].
* **Format:** `country, players, points`
* **Data Parsing Challenges:**
    * **Structure:** The `players` and `points` columns contain array-like strings (e.g., `[2,4,5]`) that must be parsed to map specific points to specific player IDs.

## Prerequisites

* **Node.js:** Ensure you have Node.js installed (v14+ recommended for `node:fs/promises` support).

## Installation & Usage

1.  **Download Files:** Ensure the following three files are in the same directory:
    * `final-solution.js`
    * `players.csv`
    * `games.csv`

2.  **Run the Script:**
    Open your terminal, navigate to the directory, and run:
    ```bash
    node final-solution.js
    ```

## Logic & Implementation Details

### Unit Conversions
To ensure accurate sorting and comparison, the script performs the following normalizations:
* **Weight:** All weights are converted to pounds (lbs). Logic: `1 kg = 2.20462 lbs`.
* **Height:** All heights are converted to centimeters (cm). Logic: `((Feet * 12) + Inches) * 2.54`.

### Data Relationship
* **Question 3** requires a relational join logic. The script creates a lookup object of Canadian Males from `players.csv` and cross-references it with player IDs found in `games.csv` to aggregate total points.

## Example Output

When running the script, the output will appear as follows:

```text
TOP 5 HEAVIEST MALE PLAYERS:
[Name] - [Country] - [Weight]lbs
...

TALLEST FEMALE PLAYER FROM CHINA:
The tallest female basketball player from China is [Name], [Height]cm tall.

HIGHEST SCORING MALE CANADIAN PLAYER:
Highest Scoring Male Canadian Player: [Name], Total Points: [Score]
