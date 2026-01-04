import fs from "node:fs/promises";
import { EOL } from "node:os";

// ====================
// - Helper Functions -
// ====================

// ====================================================================================================================
// Question 1 Helper Function: Find the 5 heaviest male players (all weights converted to lbs for accurate comparison.)
// ====================================================================================================================

// weight is given as example: "200lbs" or "90kgs". this format needs to be parsed into number and unit, then converted to lbs if needed.

function findHeaviestMales(rows, count) {
  return (
    rows
      // filter to only males using index [4] === "m"
      .filter((row) => {
        const columns = row.split(",");
        return columns[4].trim().toLowerCase() === "m";
      })
      // Convert the row string into an object
      .map((row) => {
        const [id, firstName, lastName, country, gender, age, weightStr] =
          row.split(",");
        // assign the weightValue by parsing the number out of weightStr
        const weightValue = parseFloat(weightStr);
        // assign the weightUnit by removing the number from weightStr
        const weightUnit = weightStr
          .replace(weightValue, "")
          .trim()
          .toLowerCase();
        // use lbs as standard unit
        let weightLbs;
        // convert kgs to lbs if needed
        if (weightUnit === "kg") {
          weightLbs = weightValue * 2.20462;
        } else {
          weightLbs = weightValue;
        }
        // return the player object
        return { id, name: `${firstName} ${lastName}`, country, weightLbs };
      })
      // sort by weight descending (Heaviest -> Lightest)
      .sort((a, b) => b.weightLbs - a.weightLbs)
      // Get the top 'count' heaviest players
      .slice(0, count)
  );
}

// ==================================================================================
// Question 2 Helper Function: Find the tallest female player from a specific country
// ==================================================================================

// height is given as example: "6feet5inches". this format needs to be parsed into feet = 6, inches = 5, then convert to total inches (1 foot = 12 inches, then convert inches to cm (1 inch = 2.54 cm)

function findTallestFemaleFromCountry(rows, countryName) {
  // Initialize tallest as null
  let tallest = null;
  // filter to only females from the specified country
  rows
    .filter((row) => {
      const columns = row.split(",");
      return (
        columns[3].trim().toLowerCase() === countryName.toLowerCase() &&
        columns[4].trim().toLowerCase() === "f"
      );
    })
    // convert each row to an object
    .forEach((row) => {
      const [id, firstName, lastName, country, gender, age, heightStr] =
        row.split(",");
      // parse heightStr to extract feet and inches:
      // look for "number"feet and "number"inches using regex
      const feetMatch = heightStr.match(/(\d+)feet/);
      const inchesMatch = heightStr.match(/(\d+)inches/);
      // extract the numbers found using regex and assign them to the variables feet and inches. If no number exists, default to 0
      const feet = feetMatch ? parseInt(feetMatch[1]) : 0;
      const inches = inchesMatch ? parseInt(inchesMatch[1]) : 0;
      // Convert total height to cm
      const totalInches = feet * 12 + inches;
      const heightCm = totalInches * 2.54;
      // Check if this player is the tallest so far (for first iteration, tallest is null so we need to include or !tallest)
      if (!tallest || heightCm > tallest.height) {
        tallest = {
          id,
          name: `${firstName} ${lastName}`,
          country,
          height: heightCm,
        };
      }
    });
  return tallest;
}

// ==========================================================================================
// Question 3 Helper Function: Find the highest scoring male Canadian player across all games
// ==========================================================================================

function findHighestScoringCanadianMale(playerRows, gameRows) {
  // 1. Build a lookup Object for Canadian Males ONLY
  // ------------------------------------------------
  // initialize an empty object to hold canadian male players
  const canadianMales = {};
  //
  playerRows.forEach((row) => {
    // split the row into columns
    const cols = row.split(",");
    // destructure the columns and assign each to a variable
    const id = cols[0].trim();
    const firstName = cols[1].trim();
    const lastName = cols[2].trim();
    const country = cols[3].trim();
    const gender = cols[4].trim();
    // check if the player is a male from Canada
    if (country.toLowerCase() === "canada" && gender.toLowerCase() === "m") {
      // add to the canadianMales object with initial totalPoints of 0
      canadianMales[id] = {
        name: `${firstName} ${lastName}`,
        totalPoints: 0,
      };
    }
  });

    // 2. Process the Games File using String Split
    // --------------------------------------------
    gameRows.forEach((row) => {
        if (!row.trim()) return;

        // split the row by the open bracket '['
        const parts = row.split("[");

        // ensure there are at least 3 parts (Country, Players, Points)
        if (parts.length < 3) return;

        // clean up the "Country" part (Index 0): remove commas and whitespaces from "Canada, " -> "Canada"
        const country = parts[0].replace(/,/g, "").trim();

        // clean up the "Players" part (Index 1): split at ']' and take the first half ("10,27], " -> "10,27")
        const playerIdsStr = parts[1].split("]")[0];

        // clean up the "Points" part (Index 2): split at ']' and take the first half ("2,8]" -> "2,8")
        const pointsStr = parts[2].split("]")[0];

        //check if the country is Canada
        if (country.toLowerCase() === "canada") {
            // split playerIdsStr and pointsStr by ',' to get arrays
            const playerIds = playerIdsStr.split(",");
            const points = pointsStr.split(",");
            // loop through playerIds and points simultaneously
            playerIds.forEach((rawId, index) => {
                // trim whitespace from the id
                const id = rawId.trim();
                // Ensure points exist at this index
                if (points[index]) {
                    // parse the point value as an integer
                    const pointValue = parseInt(points[index].trim());
                    // check if this id exists in canadianMales
                    if (canadianMales[id]) {
                        // add the pointValue to the player's totalPoints
                        canadianMales[id].totalPoints += pointValue;
                    }
                }
            });
        }
    });

    // 3. Find the winner
    // -------------------
    // initialize variables to track highest scoring player
    let highestScoringPlayer = null;
    let maxPoints = -1;
    // loop through canadianMales to find the player with the highest totalPoints
    Object.values(canadianMales).forEach(player => {
        // check if this player's totalPoints is greater than maxPoints
        if (player.totalPoints > maxPoints) {
            // update maxPoints and highestScoringPlayer
            maxPoints = player.totalPoints;
            highestScoringPlayer = player;
        }
    });

    return highestScoringPlayer;
}

// ==============
// Main Execution
// ==============

async function main() {
  try {
    // --- QUESTION 1: What are the names of the 5 heaviest male players among all countries?
    // read players.csv
    const playersData = await fs.readFile("players.csv", "utf8");
    // split into rows
    const playerRows = playersData.split(EOL);
    // print header for question 2
    console.log("\nTOP 5 HEAVIEST MALE PLAYERS:");
    // call helper function findHeaviestMales with 5 as count
    const heaviestMales = findHeaviestMales(playerRows, 5);
    // print each player's name, country, and weight in lbs (formatted to 2 decimal places)
    heaviestMales.forEach((player) => {
      console.log(
        `${player.name} - ${player.country} - ${player.weightLbs.toFixed(2)}lbs`
      );
    });

    // --- QUESTION 2: Who is the tallest female basketball player from China?
    // print header for question 2
    console.log("\nTALLEST FEMALE PLAYER FROM CHINA:");
    // call helper function findTallestFemaleFromCountry with "China" as countryName
    const tallestFemaleChina = findTallestFemaleFromCountry(
      playerRows,
      "China"
    );
    // print the result
    if (tallestFemaleChina) {
      console.log(
        `The tallest female basketball player from China is ${tallestFemaleChina.name}, ${tallestFemaleChina.height}cm tall.`
      );
    } else {
      console.log("No female players found from China.");
    }

    // --- QUESTION 3: Who was the highest scoring male Canadian basketball player across all games that Canada played?
    // print header for question 3
    console.log("\nHIGHEST SCORING MALE CANADIAN PLAYER:");
    // read games.csv
    const gamesData = await fs.readFile("games.csv", "utf8");
    // split into rows
    const gameRows = gamesData.split(EOL);
    // call helper function findHighestScoringCanadianMale with playerRows and gameRows
    const highestScoringCanadianMale = findHighestScoringCanadianMale(
      playerRows,
      gameRows
    );
    // print the result
    if (highestScoringCanadianMale) {
      console.log(
        `Highest Scoring Male Canadian Player: ${highestScoringCanadianMale.name}, Total Points: ${highestScoringCanadianMale.totalPoints}`
      );
    } else {
      console.log("No male Canadian players found.");
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

main();
